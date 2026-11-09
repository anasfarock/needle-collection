import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import type { Product, Order, Customer } from '../data/store';
import {
  initialProducts,
  initialCustomers,
  initialOrders,
  defaultBlocks,
  defaultBanners,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_NAME,
  type ContentBlockData,
  type BannerItemData,
} from './initialData';
import { hashPassword } from './auth';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}

export interface SiteContentData {
  blocks: ContentBlockData[];
  banners: BannerItemData[];
}

interface LocalDatabaseSchema {
  admins: AdminAccount[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  content: SiteContentData;
}

// Prisma Singleton for Vercel Serverless
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSeeded?: boolean;
  memoryDb?: LocalDatabaseSchema;
};

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

const LOCAL_DB_PATH = path.resolve(process.cwd(), '.data', 'db.json');

function createInitialLocalDb(): LocalDatabaseSchema {
  return {
    admins: [
      {
        id: 'admin-1',
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        name: DEFAULT_ADMIN_NAME,
        role: 'Owner',
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      },
    ],
    products: structuredClone(initialProducts),
    customers: structuredClone(initialCustomers),
    orders: structuredClone(initialOrders),
    content: {
      blocks: structuredClone(defaultBlocks),
      banners: structuredClone(defaultBanners),
    },
  };
}

function readLocalDb(): LocalDatabaseSchema {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as LocalDatabaseSchema;
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.admins)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to memory if read fails
  }

  if (!globalForPrisma.memoryDb) {
    globalForPrisma.memoryDb = createInitialLocalDb();
    writeLocalDb(globalForPrisma.memoryDb);
  }
  return globalForPrisma.memoryDb;
}

function writeLocalDb(data: LocalDatabaseSchema): void {
  globalForPrisma.memoryDb = data;
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore on read-only serverless filesystems when DATABASE_URL is absent
  }
}

async function ensurePrismaSeeded(prisma: PrismaClient): Promise<void> {
  if (globalForPrisma.prismaSeeded) return;

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    await prisma.adminUser.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        name: DEFAULT_ADMIN_NAME,
        role: 'Owner',
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      },
    });
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    for (const p of initialProducts) {
      await prisma.product.create({
        data: {
          id: p.id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          fabric: p.fabric,
          season: p.season,
          status: p.status,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          images: p.images as any,
          colors: p.colors as any,
          sizes: p.sizes as any,
          stock: p.stock,
          isNew: Boolean(p.isNew),
          isSale: Boolean(p.isSale),
          publishedAt: p.publishedAt ?? new Date().toISOString().split('T')[0],
        },
      });
    }
  }

  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    for (const c of initialCustomers) {
      await prisma.customer.create({
        data: {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email ?? null,
          city: c.city ?? null,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
          lastOrderAt: c.lastOrderAt ?? null,
        },
      });
    }

    for (const o of initialOrders) {
      await prisma.order.create({
        data: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customer.id,
          items: o.items as any,
          subtotal: o.subtotal,
          discount: o.discount,
          shipping: o.shipping,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          shippingAddress: o.shippingAddress as any,
          notes: o.notes ?? null,
          createdAt: new Date(o.createdAt),
        },
      });
    }
  }

  const contentRecord = await prisma.siteContent.findUnique({ where: { id: 'default' } });
  if (!contentRecord) {
    await prisma.siteContent.create({
      data: {
        id: 'default',
        blocks: defaultBlocks as any,
        banners: defaultBanners as any,
      },
    });
  }

  globalForPrisma.prismaSeeded = true;
}

function mapPrismaProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    category: row.category,
    subcategory: row.subcategory || '',
    fabric: row.fabric || '',
    season: row.season || 'All',
    status: (row.status as Product['status']) || 'active',
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    images: Array.isArray(row.images) ? row.images : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    stock: row.stock,
    isNew: Boolean(row.isNew),
    isSale: Boolean(row.isSale),
    publishedAt: row.publishedAt || row.createdAt?.toISOString?.()?.split('T')[0],
  };
}

function mapPrismaCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    city: row.city ?? undefined,
    totalOrders: row.totalOrders,
    totalSpent: row.totalSpent,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    lastOrderAt: row.lastOrderAt ?? undefined,
  };
}

function mapPrismaOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customer: mapPrismaCustomer(row.customer),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
    status: row.status as Order['status'],
    paymentStatus: row.paymentStatus as Order['paymentStatus'],
    paymentMethod: row.paymentMethod as Order['paymentMethod'],
    shippingAddress: row.shippingAddress as Order['shippingAddress'],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export const db = {
  async findAdminByEmail(email: string): Promise<AdminAccount | null> {
    const normalized = email.trim().toLowerCase();
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const admin = await prisma.adminUser.findUnique({ where: { email: normalized } });
        return admin;
      } catch (err) {
        console.warn('Prisma query failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    return local.admins.find(a => a.email.toLowerCase() === normalized) || null;
  },

  async findAdminById(id: string): Promise<AdminAccount | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const admin = await prisma.adminUser.findUnique({ where: { id } });
        return admin;
      } catch (err) {
        console.warn('Prisma query failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    return local.admins.find(a => a.id === id) || null;
  },

  async updateAdmin(id: string, updates: { email?: string; name?: string; passwordHash?: string }): Promise<AdminAccount | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const updated = await prisma.adminUser.update({
          where: { id },
          data: {
            ...(updates.email ? { email: updates.email.trim().toLowerCase() } : {}),
            ...(updates.name ? { name: updates.name.trim() } : {}),
            ...(updates.passwordHash ? { passwordHash: updates.passwordHash } : {}),
          },
        });
        return updated;
      } catch (err) {
        console.warn('Prisma updateAdmin failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    const idx = local.admins.findIndex(a => a.id === id);
    if (idx === -1) return null;
    if (updates.email) local.admins[idx].email = updates.email.trim().toLowerCase();
    if (updates.name) local.admins[idx].name = updates.name.trim();
    if (updates.passwordHash) local.admins[idx].passwordHash = updates.passwordHash;
    writeLocalDb(local);
    return local.admins[idx];
  },

  async getProducts(): Promise<Product[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(mapPrismaProduct);
      } catch (err) {
        console.warn('Prisma getProducts failed, falling back to local DB:', err);
      }
    }
    return readLocalDb().products;
  },

  async createProduct(input: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const baseSlug = (input.slug || input.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `product-${Date.now()}`;

    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
        const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
        const created = await prisma.product.create({
          data: {
            slug: finalSlug,
            title: input.title,
            subtitle: input.subtitle || '',
            description: input.description || '',
            category: input.category,
            subcategory: input.subcategory || '',
            fabric: input.fabric || '',
            season: input.season || 'All',
            status: input.status || 'active',
            price: Number(input.price) || 0,
            compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null,
            images: (input.images?.length ? input.images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop']) as any,
            colors: (input.colors?.length ? input.colors : [{ name: 'Default', hex: '#F6F1E9' }]) as any,
            sizes: (input.sizes?.length ? input.sizes : ['S', 'M', 'L', 'XL']) as any,
            stock: Number(input.stock) || 0,
            isNew: Boolean(input.isNew),
            isSale: Boolean(input.isSale),
            publishedAt: input.publishedAt || new Date().toISOString().split('T')[0],
          },
        });
        return mapPrismaProduct(created);
      } catch (err) {
        console.warn('Prisma createProduct failed, falling back to local DB:', err);
      }
    }

    const local = readLocalDb();
    const slugExists = local.products.some(p => p.slug === baseSlug);
    const finalSlug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const newProduct: Product = {
      id: input.id || `p${Date.now()}`,
      slug: finalSlug,
      title: input.title,
      subtitle: input.subtitle || '',
      description: input.description || '',
      category: input.category,
      subcategory: input.subcategory || '',
      fabric: input.fabric || '',
      season: input.season || 'All',
      status: input.status || 'active',
      price: Number(input.price) || 0,
      compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : undefined,
      images: input.images?.length ? input.images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop'],
      colors: input.colors?.length ? input.colors : [{ name: 'Default', hex: '#F6F1E9' }],
      sizes: input.sizes?.length ? input.sizes : ['S', 'M', 'L', 'XL'],
      stock: Number(input.stock) || 0,
      isNew: Boolean(input.isNew),
      isSale: Boolean(input.isSale),
      publishedAt: input.publishedAt || new Date().toISOString().split('T')[0],
    };
    local.products.unshift(newProduct);
    writeLocalDb(local);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const data: Record<string, any> = {};
        if (updates.title !== undefined) data.title = updates.title;
        if (updates.slug !== undefined) data.slug = updates.slug;
        if (updates.subtitle !== undefined) data.subtitle = updates.subtitle;
        if (updates.description !== undefined) data.description = updates.description;
        if (updates.category !== undefined) data.category = updates.category;
        if (updates.subcategory !== undefined) data.subcategory = updates.subcategory;
        if (updates.fabric !== undefined) data.fabric = updates.fabric;
        if (updates.season !== undefined) data.season = updates.season;
        if (updates.status !== undefined) data.status = updates.status;
        if (updates.price !== undefined) data.price = Number(updates.price) || 0;
        if ('compareAtPrice' in updates) {
          data.compareAtPrice = updates.compareAtPrice ? Number(updates.compareAtPrice) : null;
        }
        if (updates.images !== undefined) data.images = updates.images;
        if (updates.colors !== undefined) data.colors = updates.colors;
        if (updates.sizes !== undefined) data.sizes = updates.sizes;
        if (updates.stock !== undefined) data.stock = Number(updates.stock) || 0;
        if (updates.isNew !== undefined) data.isNew = Boolean(updates.isNew);
        if (updates.isSale !== undefined) data.isSale = Boolean(updates.isSale);

        const updated = await prisma.product.update({
          where: { id },
          data,
        });
        return mapPrismaProduct(updated);
      } catch (err) {
        console.warn('Prisma updateProduct failed, falling back to local DB:', err);
      }
    }

    const local = readLocalDb();
    const idx = local.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    local.products[idx] = { ...local.products[idx], ...updates };
    writeLocalDb(local);
    return local.products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        await prisma.product.delete({ where: { id } });
        return true;
      } catch (err) {
        console.warn('Prisma deleteProduct failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    const initialLen = local.products.length;
    local.products = local.products.filter(p => p.id !== id);
    writeLocalDb(local);
    return local.products.length < initialLen;
  },

  async getOrders(): Promise<Order[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const rows = await prisma.order.findMany({
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapPrismaOrder);
      } catch (err) {
        console.warn('Prisma getOrders failed, falling back to local DB:', err);
      }
    }
    return readLocalDb().orders;
  },

  async createOrder(orderInput: {
    customer: { name: string; phone: string; email?: string; city?: string };
    items: Order['items'];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    paymentMethod: Order['paymentMethod'];
    shippingAddress: Order['shippingAddress'];
    notes?: string;
  }): Promise<{ order: Order; customer: Customer }> {
    const orderNum = `NC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const nowIso = new Date().toISOString();

    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const existingCustomer = await prisma.customer.findUnique({
          where: { phone: orderInput.customer.phone },
        });

        const customerRow = existingCustomer
          ? await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: {
                name: orderInput.customer.name,
                email: orderInput.customer.email || existingCustomer.email,
                city: orderInput.customer.city || existingCustomer.city,
                totalOrders: { increment: 1 },
                totalSpent: { increment: orderInput.total },
                lastOrderAt: nowIso.split('T')[0],
              },
            })
          : await prisma.customer.create({
              data: {
                name: orderInput.customer.name,
                phone: orderInput.customer.phone,
                email: orderInput.customer.email || null,
                city: orderInput.customer.city || null,
                totalOrders: 1,
                totalSpent: orderInput.total,
                lastOrderAt: nowIso.split('T')[0],
              },
            });

        // Decrement product stock for each ordered item
        for (const item of orderInput.items) {
          if (item.product?.id) {
            await prisma.product.updateMany({
              where: { id: item.product.id },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        const createdOrder = await prisma.order.create({
          data: {
            orderNumber: orderNum,
            customerId: customerRow.id,
            items: orderInput.items as any,
            subtotal: orderInput.subtotal,
            discount: orderInput.discount,
            shipping: orderInput.shipping,
            total: orderInput.total,
            status: 'pending',
            paymentStatus: orderInput.paymentMethod === 'cod' ? 'unpaid' : 'paid',
            paymentMethod: orderInput.paymentMethod,
            shippingAddress: orderInput.shippingAddress as any,
            notes: orderInput.notes || null,
          },
          include: { customer: true },
        });

        return {
          order: mapPrismaOrder(createdOrder),
          customer: mapPrismaCustomer(customerRow),
        };
      } catch (err) {
        console.warn('Prisma createOrder failed, falling back to local DB:', err);
      }
    }

    const local = readLocalDb();
    let cust = local.customers.find(c => c.phone === orderInput.customer.phone);
    if (cust) {
      cust.name = orderInput.customer.name;
      if (orderInput.customer.email) cust.email = orderInput.customer.email;
      if (orderInput.customer.city) cust.city = orderInput.customer.city;
      cust.totalOrders += 1;
      cust.totalSpent += orderInput.total;
      cust.lastOrderAt = nowIso.split('T')[0];
    } else {
      cust = {
        id: `c${Date.now()}`,
        name: orderInput.customer.name,
        phone: orderInput.customer.phone,
        email: orderInput.customer.email,
        city: orderInput.customer.city,
        totalOrders: 1,
        totalSpent: orderInput.total,
        createdAt: nowIso.split('T')[0],
        lastOrderAt: nowIso.split('T')[0],
      };
      local.customers.unshift(cust);
    }

    // Decrement product stock in local DB
    for (const item of orderInput.items) {
      const prod = local.products.find(p => p.id === item.product.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    const newOrder: Order = {
      id: `o${Date.now()}`,
      orderNumber: orderNum,
      customer: cust,
      items: orderInput.items,
      subtotal: orderInput.subtotal,
      discount: orderInput.discount,
      shipping: orderInput.shipping,
      total: orderInput.total,
      status: 'pending',
      paymentStatus: orderInput.paymentMethod === 'cod' ? 'unpaid' : 'paid',
      paymentMethod: orderInput.paymentMethod,
      shippingAddress: orderInput.shippingAddress,
      notes: orderInput.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    local.orders.unshift(newOrder);
    writeLocalDb(local);
    return { order: newOrder, customer: cust };
  },

  async updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<Order | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status,
            ...(paymentStatus ? { paymentStatus } : status === 'delivered' ? { paymentStatus: 'paid' } : {}),
          },
          include: { customer: true },
        });
        return mapPrismaOrder(updated);
      } catch (err) {
        console.warn('Prisma updateOrderStatus failed, falling back to local DB:', err);
      }
    }

    const local = readLocalDb();
    const idx = local.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    local.orders[idx].status = status;
    if (paymentStatus) {
      local.orders[idx].paymentStatus = paymentStatus;
    } else if (status === 'delivered') {
      local.orders[idx].paymentStatus = 'paid';
    }
    local.orders[idx].updatedAt = new Date().toISOString();
    writeLocalDb(local);
    return local.orders[idx];
  },

  async getCustomers(): Promise<Customer[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const rows = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(mapPrismaCustomer);
      } catch (err) {
        console.warn('Prisma getCustomers failed, falling back to local DB:', err);
      }
    }
    return readLocalDb().customers;
  },

  async getContent(): Promise<SiteContentData> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const record = await prisma.siteContent.findUnique({ where: { id: 'default' } });
        if (record) {
          return {
            blocks: Array.isArray(record.blocks) ? (record.blocks as unknown as ContentBlockData[]) : defaultBlocks,
            banners: Array.isArray(record.banners) ? (record.banners as unknown as BannerItemData[]) : defaultBanners,
          };
        }
      } catch (err) {
        console.warn('Prisma getContent failed, falling back to local DB:', err);
      }
    }
    return readLocalDb().content;
  },

  async updateContent(content: Partial<SiteContentData>): Promise<SiteContentData> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSeeded(prisma);
        const existing = await prisma.siteContent.findUnique({ where: { id: 'default' } });
        const nextBlocks = content.blocks ?? (existing?.blocks as any) ?? defaultBlocks;
        const nextBanners = content.banners ?? (existing?.banners as any) ?? defaultBanners;
        const updated = await prisma.siteContent.upsert({
          where: { id: 'default' },
          create: { id: 'default', blocks: nextBlocks, banners: nextBanners },
          update: { blocks: nextBlocks, banners: nextBanners },
        });
        return {
          blocks: updated.blocks as unknown as ContentBlockData[],
          banners: updated.banners as unknown as BannerItemData[],
        };
      } catch (err) {
        console.warn('Prisma updateContent failed, falling back to local DB:', err);
      }
    }

    const local = readLocalDb();
    if (content.blocks) local.content.blocks = content.blocks;
    if (content.banners) local.content.banners = content.banners;
    writeLocalDb(local);
    return local.content;
  },
};

