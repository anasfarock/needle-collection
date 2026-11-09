import type { IncomingMessage, ServerResponse } from 'node:http';
import { db } from './db';
import { hashPassword, verifyPassword, signToken, verifyToken, type AdminTokenPayload } from './auth';

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      return req.body ? JSON.parse(req.body) : {};
    }
    return req.body;
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getAuthenticatedAdmin(req: IncomingMessage): AdminTokenPayload | null {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const headerVal = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!headerVal || !headerVal.startsWith('Bearer ')) return null;
  const token = headerVal.slice('Bearer '.length).trim();
  return verifyToken(token);
}

function resolveApiPath(req: IncomingMessage): string {
  const rawUrl = req.url || '/api';
  const parsed = new URL(rawUrl, 'http://localhost');
  const rewrittenPath = parsed.searchParams.get('__path');
  if (rewrittenPath) {
    return `/api/${rewrittenPath.replace(/^\/+/, '')}`;
  }
  return parsed.pathname;
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method || 'GET').toUpperCase();
  const pathname = resolveApiPath(req).replace(/\/+$/, '') || '/api';

  try {
    // 1. POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Please enter both email and password.' });
      }

      const admin = await db.findAdminByEmail(email);
      if (!admin || !verifyPassword(password, admin.passwordHash)) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      const token = signToken({
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      return sendJson(res, 200, {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    }

    // 2. GET /api/auth/me
    if (pathname === '/api/auth/me' && method === 'GET') {
      const tokenPayload = getAuthenticatedAdmin(req);
      if (!tokenPayload) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }
      const admin = await db.findAdminById(tokenPayload.sub);
      if (!admin) {
        return sendJson(res, 401, { error: 'Admin account not found' });
      }
      return sendJson(res, 200, {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    }

    // 3. PUT /api/auth/profile (update email / name / password)
    if (pathname === '/api/auth/profile' && method === 'PUT') {
      const tokenPayload = getAuthenticatedAdmin(req);
      if (!tokenPayload) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }
      const admin = await db.findAdminById(tokenPayload.sub);
      if (!admin) {
        return sendJson(res, 404, { error: 'Admin account not found' });
      }

      const body = await parseJsonBody(req);
      const updates: { email?: string; name?: string; passwordHash?: string } = {};

      if (body.name && String(body.name).trim()) {
        updates.name = String(body.name).trim();
      }
      if (body.email && String(body.email).trim()) {
        updates.email = String(body.email).trim().toLowerCase();
      }
      if (body.newPassword) {
        if (!body.currentPassword || !verifyPassword(String(body.currentPassword), admin.passwordHash)) {
          return sendJson(res, 400, { error: 'Current password is incorrect.' });
        }
        if (String(body.newPassword).length < 6) {
          return sendJson(res, 400, { error: 'New password must be at least 6 characters.' });
        }
        updates.passwordHash = hashPassword(String(body.newPassword));
      }

      const updated = await db.updateAdmin(admin.id, updates);
      if (!updated) {
        return sendJson(res, 500, { error: 'Failed to update profile.' });
      }

      const newToken = signToken({
        sub: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      });

      return sendJson(res, 200, {
        token: newToken,
        admin: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
        },
      });
    }

    // 4. GET /api/bootstrap (load products, orders, customers, content)
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const [products, orders, customers, content] = await Promise.all([
        db.getProducts(),
        db.getOrders(),
        db.getCustomers(),
        db.getContent(),
      ]);
      return sendJson(res, 200, { products, orders, customers, content });
    }

    // 5. Products endpoints
    if (pathname === '/api/products' && method === 'GET') {
      const products = await db.getProducts();
      return sendJson(res, 200, { products });
    }

    if (pathname === '/api/products' && method === 'POST') {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { error: 'Unauthorized: Admin login required.' });
      }
      const body = await parseJsonBody(req);
      if (!body.title || body.price === undefined) {
        return sendJson(res, 400, { error: 'Title and price are required.' });
      }
      const product = await db.createProduct(body);
      return sendJson(res, 201, { product });
    }

    const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch) {
      const productId = decodeURIComponent(productMatch[1]);
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { error: 'Unauthorized: Admin login required.' });
      }

      if (method === 'PUT' || method === 'PATCH') {
        const body = await parseJsonBody(req);
        const updated = await db.updateProduct(productId, body);
        if (!updated) {
          return sendJson(res, 404, { error: 'Product not found.' });
        }
        return sendJson(res, 200, { product: updated });
      }

      if (method === 'DELETE') {
        const deleted = await db.deleteProduct(productId);
        if (!deleted) {
          return sendJson(res, 404, { error: 'Product not found.' });
        }
        return sendJson(res, 200, { success: true });
      }
    }

    // 6. Orders endpoints
    if (pathname === '/api/orders' && method === 'GET') {
      const orders = await db.getOrders();
      return sendJson(res, 200, { orders });
    }

    if (pathname === '/api/orders' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.customer?.name || !body.customer?.phone || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJson(res, 400, { error: 'Customer details and order items are required.' });
      }
      const result = await db.createOrder(body);
      return sendJson(res, 201, result);
    }

    const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && (method === 'PATCH' || method === 'PUT')) {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { error: 'Unauthorized: Admin login required.' });
      }
      const orderId = decodeURIComponent(orderMatch[1]);
      const body = await parseJsonBody(req);
      const updated = await db.updateOrderStatus(orderId, body.status, body.paymentStatus);
      if (!updated) {
        return sendJson(res, 404, { error: 'Order not found.' });
      }
      return sendJson(res, 200, { order: updated });
    }

    // 7. Customers endpoints
    if (pathname === '/api/customers' && method === 'GET') {
      const customers = await db.getCustomers();
      return sendJson(res, 200, { customers });
    }

    // 8. Site Content endpoints
    if (pathname === '/api/content' && method === 'GET') {
      const content = await db.getContent();
      return sendJson(res, 200, { content });
    }

    if (pathname === '/api/content' && (method === 'PUT' || method === 'POST')) {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { error: 'Unauthorized: Admin login required.' });
      }
      const body = await parseJsonBody(req);
      const content = await db.updateContent(body);
      return sendJson(res, 200, { content });
    }

    return sendJson(res, 404, { error: `API route not found: ${method} ${pathname}` });
  } catch (err: any) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: err?.message || 'Internal Server Error' });
  }
}

