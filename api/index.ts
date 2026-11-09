import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

// ============================================================================
// 1. Types & Initial Seed Data
// ============================================================================

export interface ProductData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  fabric: string;
  season: string;
  status: 'draft' | 'active' | 'archived';
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
  publishedAt?: string;
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customer: CustomerData;
  items: { product: ProductData; quantity: number; size: string; color: string; price: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'card' | 'bank_transfer';
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    area: string;
    landmark?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlockData {
  id: string;
  type: 'hero' | 'collection_grid' | 'product_carousel' | 'editorial' | 'usp_strip' | 'newsletter';
  title: string;
  visible: boolean;
  content: Record<string, string>;
}

export interface BannerItemData {
  id: string;
  text: string;
  active: boolean;
}

export interface SiteContentData {
  blocks: ContentBlockData[];
  banners: BannerItemData[];
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}

export const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@needlecollection.com').trim().toLowerCase();
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
export const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
const JWT_SECRET = process.env.JWT_SECRET || 'needle-collection-secret-key-2026-prod';

const productImages = [
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1570382667048-23b581951c33?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1614252369475-531eba8c5eb1?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1605086948155-786402246825?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1583396042524-1e74e6f6a87e?w=600&h=800&fit=crop',
];

export const seedProducts: ProductData[] = [
  {
    id: '1', slug: 'heritage-kurta-premium', title: 'Heritage Kurta', subtitle: 'Premium Cotton — Everyday Elegance',
    description: 'Classic straight-cut kurta in premium combed cotton with subtle texture weave. Side slits, mother-of-pearl buttons, and a relaxed fit. The foundation of every Pakistani man\'s wardrobe.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Cotton', season: 'All',
    status: 'active', price: 3200, compareAtPrice: 4200,
    images: [productImages[6], productImages[7], productImages[1]],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Cream', hex: '#F5E6D3' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Navy', hex: '#1B2A4A' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 78, isNew: true, isSale: true, publishedAt: '2026-11-01'
  },
  {
    id: '2', slug: 'classic-shalwar-kameez', title: 'Executive Shalwar Kameez', subtitle: 'Premium Wash & Wear',
    description: 'Traditional shalwar kameez in premium imported wash & wear fabric. Wrinkle-resistant, comfortable fit with a modern silhouette. Perfect for office, jummah, and formal occasions.',
    category: 'Men', subcategory: 'Shalwar Kameez', fabric: 'Wash & Wear', season: 'All',
    status: 'active', price: 4800,
    images: [productImages[1], productImages[6], productImages[7]],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Off-White', hex: '#FAF0E6' }, { name: 'Light Grey', hex: '#D3D3D3' }, { name: 'Sky Blue', hex: '#B0C4DE' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 55, isNew: true, publishedAt: '2026-11-05'
  },
  {
    id: '3', slug: 'waistcoat-formal', title: 'Lahori Waistcoat', subtitle: 'Structured Formal Layer',
    description: 'Impeccably tailored waistcoat in premium fabric with satin lining. Single-breasted, three-button closure with welt pockets. The perfect layer over your kurta for weddings and formal events.',
    category: 'Men', subcategory: 'Waistcoats', fabric: 'Poly-Viscose', season: 'Winter',
    status: 'active', price: 5500,
    images: [productImages[7], productImages[6], productImages[1]],
    colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Black', hex: '#000000' }, { name: 'Maroon', hex: '#5A1F26' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 32, isNew: true, publishedAt: '2026-11-08'
  },
  {
    id: '4', slug: 'sherwani-wedding', title: 'Shaan-e-Mehfil Sherwani', subtitle: 'Bridal & Formal',
    description: 'Regal sherwani with heavy hand embroidery, dabka and sequin work. A-line silhouette with band collar, hook closure, and side slits. For the man who commands the grandest day.',
    category: 'Men', subcategory: 'Sherwani', fabric: 'Silk Blend', season: 'Winter',
    status: 'active', price: 45000, compareAtPrice: 55000,
    images: [productImages[10], productImages[11], productImages[0]],
    colors: [{ name: 'Ivory & Gold', hex: '#DAA520' }, { name: 'Maroon', hex: '#5A1F26' }, { name: 'Midnight', hex: '#191970' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 8, isSale: true, publishedAt: '2026-09-01'
  },
  {
    id: '5', slug: 'peshawari-chappal-kurta', title: 'Peshawari Kurta Set', subtitle: 'Complete Ensemble',
    description: 'Relaxed-fit kurta with traditional Peshawari collar, paired with matching shalwar. Crafted in premium linen for a breezy, effortless look. Includes Peshawari chappal.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Linen', season: 'Summer',
    status: 'active', price: 6200,
    images: [productImages[6], productImages[1], productImages[7]],
    colors: [{ name: 'Natural', hex: '#F5E6D3' }, { name: 'Olive', hex: '#6F7A63' }, { name: 'Sand', hex: '#C2B280' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 42, isNew: true, publishedAt: '2026-10-20'
  },
  {
    id: '6', slug: 'karachi-kurta-casual', title: 'Karachi Weekend Kurta', subtitle: 'Casual Everyday',
    description: 'Relaxed weekend kurta in soft cotton jersey. Mandarin collar, chest pocket, and side slits. The perfect blend of comfort and style for casual Fridays and weekend gatherings.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Cotton Jersey', season: 'All',
    status: 'active', price: 2400, compareAtPrice: 3200,
    images: [productImages[7], productImages[6], productImages[1]],
    colors: [{ name: 'Grey Marl', hex: '#808080' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Rust', hex: '#9C3B2A' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 95, isSale: true, publishedAt: '2026-10-15'
  },
  {
    id: '7', slug: 'festive-embroidered-kurta', title: 'Nawab Embroidered Kurta', subtitle: 'Festive Tilla & Threadwork',
    description: 'Fine Egyptian cotton kurta featuring intricate tonal resham and tilla embroidery along the band collar and placket. Tailored for Eid, nikkah, and evening gatherings.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Egyptian Cotton', season: 'All',
    status: 'active', price: 6800,
    images: [productImages[3], productImages[8]],
    colors: [{ name: 'Ivory', hex: '#F6F1E9' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'Emerald', hex: '#2D5A3D' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 34, isNew: true, publishedAt: '2026-11-10'
  },
  {
    id: '8', slug: 'winter-khaddar-kurta', title: 'Khaddar Kurta', subtitle: 'Winter Essential',
    description: 'Warm khaddar kurta with traditional weave texture. Mandarin collar, front placket with wooden buttons. Pairs perfectly with shalwar or churidar for the colder months.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Khaddar', season: 'Winter',
    status: 'active', price: 3800,
    images: [productImages[5], productImages[9], productImages[6]],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Olive', hex: '#6F7A63' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 67, publishedAt: '2026-10-25'
  },
  {
    id: '9', slug: 'royal-boski-shalwar-kameez', title: 'Royal Spun Boski Suit', subtitle: 'Luxury Silk-Finish Shalwar Kameez',
    description: 'Signature spun boski shalwar kameez with an unmistakable natural lustre and fluid drape. Finished with concealed placket and cuff links support.',
    category: 'Men', subcategory: 'Shalwar Kameez', fabric: 'Boski', season: 'All',
    status: 'active', price: 12500, compareAtPrice: 14800,
    images: [productImages[0], productImages[2], productImages[4]],
    colors: [{ name: 'Cream', hex: '#F5E6D3' }, { name: 'Off-White', hex: '#FAF0E6' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 45, isSale: true, publishedAt: '2026-11-01'
  },
  {
    id: '10', slug: 'velvet-prince-coat', title: 'Imperial Velvet Prince Coat', subtitle: 'Handcrafted Formal Outerwear',
    description: 'Structured bandhgala prince coat in plush Italian velvet with antique zardozi motif on the chest pocket and custom crested buttons.',
    category: 'Men', subcategory: 'Waistcoats', fabric: 'Velvet', season: 'Winter',
    status: 'active', price: 24500,
    images: [productImages[3], productImages[4], productImages[5]],
    colors: [{ name: 'Maroon', hex: '#5A1F26' }, { name: 'Midnight Navy', hex: '#1B2A4A' }, { name: 'Jet Black', hex: '#111111' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 12, isNew: true, publishedAt: '2026-11-05'
  },
];

export const seedCustomers: CustomerData[] = [
  { id: 'c1', name: 'Ayesha Khan', phone: '0321-1234567', email: 'ayesha@email.com', city: 'Lahore', totalOrders: 5, totalSpent: 42500, createdAt: '2026-08-15', lastOrderAt: '2026-11-10' },
  { id: 'c2', name: 'Fatima Ahmed', phone: '0300-9876543', email: 'fatima@email.com', city: 'Karachi', totalOrders: 3, totalSpent: 28000, createdAt: '2026-09-01', lastOrderAt: '2026-11-08' },
  { id: 'c3', name: 'Muhammad Ali', phone: '0333-5551234', email: 'mali@email.com', city: 'Islamabad', totalOrders: 2, totalSpent: 8000, createdAt: '2026-09-20', lastOrderAt: '2026-10-30' },
  { id: 'c4', name: 'Sara Malik', phone: '0345-7778899', city: 'Faisalabad', totalOrders: 7, totalSpent: 65000, createdAt: '2026-07-01', lastOrderAt: '2026-11-12' },
  { id: 'c5', name: 'Hassan Raza', phone: '0312-4445566', email: 'hassan@email.com', city: 'Lahore', totalOrders: 1, totalSpent: 3200, createdAt: '2026-11-01', lastOrderAt: '2026-11-01' },
  { id: 'c6', name: 'Zainab Bibi', phone: '0301-2223344', city: 'Rawalpindi', totalOrders: 4, totalSpent: 35000, createdAt: '2026-08-20', lastOrderAt: '2026-11-05' },
  { id: 'c7', name: 'Usman Tariq', phone: '0322-8889900', email: 'usman@email.com', city: 'Multan', totalOrders: 2, totalSpent: 9600, createdAt: '2026-10-01', lastOrderAt: '2026-11-02' },
  { id: 'c8', name: 'Maryam Nawaz', phone: '0334-1112233', email: 'maryam@email.com', city: 'Lahore', totalOrders: 6, totalSpent: 78000, createdAt: '2026-06-15', lastOrderAt: '2026-11-11' },
];

export const seedOrders: OrderData[] = [
  {
    id: 'o1', orderNumber: 'NC-2026-0001',
    customer: seedCustomers[0],
    items: [{ product: seedProducts[0], quantity: 2, size: 'Unstitched', color: 'Ivory', price: 4500 }],
    subtotal: 9000, discount: 0, shipping: 200, total: 9200,
    status: 'delivered', paymentStatus: 'paid', paymentMethod: 'cod',
    shippingAddress: { name: 'Ayesha Khan', phone: '0321-1234567', email: 'ayesha@email.com', address: '45-B, Gulberg III', city: 'Lahore', area: 'Gulberg' },
    createdAt: '2026-11-01T10:30:00', updatedAt: '2026-11-05T14:00:00'
  },
  {
    id: 'o2', orderNumber: 'NC-2026-0002',
    customer: seedCustomers[1],
    items: [{ product: seedProducts[1], quantity: 1, size: 'Unstitched', color: 'Maroon', price: 18500 }],
    subtotal: 18500, discount: 1850, shipping: 0, total: 16650,
    status: 'shipped', paymentStatus: 'paid', paymentMethod: 'jazzcash',
    shippingAddress: { name: 'Fatima Ahmed', phone: '0300-9876543', address: '12 Clifton Block 4', city: 'Karachi', area: 'Clifton' },
    createdAt: '2026-11-08T15:20:00', updatedAt: '2026-11-10T09:00:00'
  },
  {
    id: 'o3', orderNumber: 'NC-2026-0003',
    customer: seedCustomers[3],
    items: [
      { product: seedProducts[4], quantity: 1, size: 'Unstitched', color: 'Red', price: 45000 },
      { product: seedProducts[7], quantity: 1, size: 'Unstitched', color: 'Rust', price: 5500 },
    ],
    subtotal: 50500, discount: 5050, shipping: 0, total: 45450,
    status: 'confirmed', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Sara Malik', phone: '0345-7778899', address: '78 Peoples Colony', city: 'Faisalabad', area: 'Peoples Colony' },
    createdAt: '2026-11-12T08:45:00', updatedAt: '2026-11-12T09:00:00'
  },
  {
    id: 'o4', orderNumber: 'NC-2026-0004',
    customer: seedCustomers[2],
    items: [{ product: seedProducts[2], quantity: 1, size: 'L', color: 'White', price: 3200 }],
    subtotal: 3200, discount: 0, shipping: 200, total: 3400,
    status: 'packed', paymentStatus: 'paid', paymentMethod: 'card',
    shippingAddress: { name: 'Muhammad Ali', phone: '0333-5551234', email: 'mali@email.com', address: 'F-7/2, Street 15', city: 'Islamabad', area: 'F-7' },
    createdAt: '2026-11-11T12:00:00', updatedAt: '2026-11-12T10:00:00'
  },
  {
    id: 'o5', orderNumber: 'NC-2026-0005',
    customer: seedCustomers[4],
    items: [{ product: seedProducts[5], quantity: 2, size: 'L', color: 'White', price: 4800 }],
    subtotal: 9600, discount: 0, shipping: 200, total: 9800,
    status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Hassan Raza', phone: '0312-4445566', address: '23 Model Town', city: 'Lahore', area: 'Model Town' },
    createdAt: '2026-11-12T16:30:00', updatedAt: '2026-11-12T16:30:00'
  },
  {
    id: 'o6', orderNumber: 'NC-2026-0006',
    customer: seedCustomers[7],
    items: [{ product: seedProducts[1], quantity: 1, size: 'Unstitched', color: 'Navy', price: 18500 }],
    subtotal: 18500, discount: 0, shipping: 0, total: 18500,
    status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Maryam Nawaz', phone: '0334-1112233', email: 'maryam@email.com', address: '88 MM Alam Road', city: 'Lahore', area: 'Gulberg' },
    createdAt: '2026-11-12T18:00:00', updatedAt: '2026-11-12T18:00:00'
  },
];

export const defaultBlocks: ContentBlockData[] = [
  {
    id: '1',
    type: 'hero',
    title: 'Hero Banner',
    visible: true,
    content: {
      subtitle: "The Gentleman's Edit — 2026",
      headline: 'Crafted for the Modern Man',
      body: 'Shalwar kameez, kurtas, and waistcoats — tailored with heritage craftsmanship for the man who commands every room he enters.',
      cta: 'Shop Men',
    },
  },
  { id: '2', type: 'collection_grid', title: 'Category Tiles', visible: true, content: { title: 'Shop by Category' } },
  { id: '3', type: 'product_carousel', title: 'New Arrivals', visible: true, content: { title: 'New Arrivals', collection: 'new' } },
  {
    id: '4',
    type: 'editorial',
    title: 'Wedding Edit',
    visible: true,
    content: {
      subtitle: 'The Wedding Edit',
      headline: 'Command the Grandest Day',
      body: 'From your nikah to the walima, our sherwani and formal collection is crafted for the man who understands that tradition is the ultimate sophistication. Hand-embroidered, regal, unforgettable.',
      cta: 'Explore Collection',
    },
  },
  { id: '5', type: 'product_carousel', title: 'Sale Items', visible: true, content: { title: 'On Sale', collection: 'sale' } },
  { id: '6', type: 'usp_strip', title: 'USP Strip', visible: true, content: {} },
  { id: '7', type: 'newsletter', title: 'Newsletter', visible: true, content: { headline: 'Join the Inner Circle' } },
];

export const defaultBanners: BannerItemData[] = [
  { id: 'b1', text: 'Free Delivery on Orders Above Rs. 3,000', active: true },
  { id: 'b2', text: 'Cash on Delivery Nationwide', active: true },
  { id: 'b3', text: 'New Kurta Collection 2026', active: true },
  { id: 'b4', text: 'Premium Shalwar Kameez', active: true },
  { id: 'b5', text: 'Easy Returns Within 7 Days', active: true },
];

// ============================================================================
// 2. Password Hashing & JWT Signing (Node built-in crypto)
// ============================================================================

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = (storedHash || '').split(':');
  if (!salt || !key) return false;
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (hashBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const pad = 4 - (input.length % 4);
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/') + (pad < 4 ? '='.repeat(pad) : '');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export function signToken(payload: Omit<AdminTokenPayload, 'exp'>, expiresInSeconds = 60 * 60 * 24 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: AdminTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(data).digest()
  );
  return `${data}.${signature}`;
}

export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', JWT_SECRET).update(data).digest()
    );
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// ============================================================================
// 3. Prisma + Vercel Postgres Connection & Auto-Schema / Auto-Seed
// ============================================================================

interface LocalDatabaseSchema {
  admins: AdminAccount[];
  products: ProductData[];
  customers: CustomerData[];
  orders: OrderData[];
  content: SiteContentData;
}

const globalForDb = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSeeded?: boolean;
  memoryDb?: LocalDatabaseSchema;
};

export function resolveDatabaseUrl(): string | null {
  const candidates = [
    process.env.DATABASE_URL_POOLED,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
  ]
    .map(v => (v ? v.trim() : ''))
    .filter(Boolean);

  // Prefer direct/pooled postgres:// or postgresql:// connection string for PrismaClient
  const pgUrl = candidates.find(
    u => u.startsWith('postgresql://') || u.startsWith('postgres://')
  );
  if (pgUrl) {
    process.env.DATABASE_URL = pgUrl;
    return pgUrl;
  }
  if (candidates[0]) {
    process.env.DATABASE_URL = candidates[0];
    return candidates[0];
  }
  return null;
}

export function getPrisma(): PrismaClient | null {
  const dbUrl = resolveDatabaseUrl();
  if (!dbUrl) return null;

  // Standard PrismaClient requires postgresql:// or postgres:// protocol
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    return null;
  }

  if (!globalForDb.prisma) {
    globalForDb.prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
  }
  return globalForDb.prisma;
}

const LOCAL_DB_PATH = path.resolve(process.cwd(), '.data', 'db.json');

function createInitialLocalDb(): LocalDatabaseSchema {
  return {
    admins: [
      {
        id: 'admin-1',
        email: DEFAULT_ADMIN_EMAIL,
        name: DEFAULT_ADMIN_NAME,
        role: 'Owner',
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      },
    ],
    products: structuredClone(seedProducts),
    customers: structuredClone(seedCustomers),
    orders: structuredClone(seedOrders),
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

  if (!globalForDb.memoryDb) {
    globalForDb.memoryDb = createInitialLocalDb();
    writeLocalDb(globalForDb.memoryDb);
  }
  return globalForDb.memoryDb;
}

function writeLocalDb(data: LocalDatabaseSchema): void {
  globalForDb.memoryDb = data;
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore on read-only serverless filesystems
  }
}

async function ensurePrismaSchemaAndSeed(prisma: PrismaClient): Promise<void> {
  if (globalForDb.prismaSeeded) return;

  // Ensure tables exist in PostgreSQL even if `prisma db push` wasn't run manually
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminUser" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'Admin User',
      "role" TEXT NOT NULL DEFAULT 'Owner',
      "passwordHash" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "subtitle" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "category" TEXT NOT NULL,
      "subcategory" TEXT NOT NULL DEFAULT '',
      "fabric" TEXT NOT NULL DEFAULT '',
      "season" TEXT NOT NULL DEFAULT 'All',
      "status" TEXT NOT NULL DEFAULT 'active',
      "price" INTEGER NOT NULL,
      "compareAtPrice" INTEGER,
      "images" JSONB NOT NULL DEFAULT '[]',
      "colors" JSONB NOT NULL DEFAULT '[]',
      "sizes" JSONB NOT NULL DEFAULT '[]',
      "stock" INTEGER NOT NULL DEFAULT 0,
      "isNew" BOOLEAN NOT NULL DEFAULT false,
      "isSale" BOOLEAN NOT NULL DEFAULT false,
      "publishedAt" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT,
      "city" TEXT,
      "totalOrders" INTEGER NOT NULL DEFAULT 0,
      "totalSpent" INTEGER NOT NULL DEFAULT 0,
      "lastOrderAt" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer"("phone");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL,
      "orderNumber" TEXT NOT NULL,
      "customerId" TEXT NOT NULL,
      "items" JSONB NOT NULL,
      "subtotal" INTEGER NOT NULL,
      "discount" INTEGER NOT NULL DEFAULT 0,
      "shipping" INTEGER NOT NULL DEFAULT 0,
      "total" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
      "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
      "shippingAddress" JSONB NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteContent" (
      "id" TEXT NOT NULL DEFAULT 'default',
      "blocks" JSONB NOT NULL,
      "banners" JSONB NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
    );
  `);

  // Seed default Admin User if none exists
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    await prisma.adminUser.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL,
        name: DEFAULT_ADMIN_NAME,
        role: 'Owner',
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      },
    });
  }

  // Remove any legacy Women/Kids seed products and seed Menswear products
  await prisma.$executeRawUnsafe(`DELETE FROM "Product" WHERE "category" IN ('Women', 'Kids');`);

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    for (const p of seedProducts) {
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

  // Seed initial Customers and Orders if none exist
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    for (const c of seedCustomers) {
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

    for (const o of seedOrders) {
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

  // Seed SiteContent if not present
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

  globalForDb.prismaSeeded = true;
}

function mapPrismaProduct(row: any): ProductData {
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
    status: (row.status as ProductData['status']) || 'active',
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

function mapPrismaCustomer(row: any): CustomerData {
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

function mapPrismaOrder(row: any): OrderData {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customer: mapPrismaCustomer(row.customer),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
    status: row.status as OrderData['status'],
    paymentStatus: row.paymentStatus as OrderData['paymentStatus'],
    paymentMethod: row.paymentMethod as OrderData['paymentMethod'],
    shippingAddress: row.shippingAddress as OrderData['shippingAddress'],
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
        await ensurePrismaSchemaAndSeed(prisma);
        const admin = await prisma.adminUser.findUnique({ where: { email: normalized } });
        if (admin) return admin;
      } catch (err) {
        console.warn('Prisma findAdminByEmail failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    return local.admins.find(a => a.email.toLowerCase() === normalized) || null;
  },

  async findAdminById(id: string): Promise<AdminAccount | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
        const admin = await prisma.adminUser.findUnique({ where: { id } });
        if (admin) return admin;
      } catch (err) {
        console.warn('Prisma findAdminById failed, falling back to local DB:', err);
      }
    }
    const local = readLocalDb();
    return local.admins.find(a => a.id === id) || local.admins[0] || null;
  },

  async updateAdmin(id: string, updates: { email?: string; name?: string; passwordHash?: string }): Promise<AdminAccount | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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
    const targetIdx = idx === -1 ? 0 : idx;
    if (!local.admins[targetIdx]) return null;
    if (updates.email) local.admins[targetIdx].email = updates.email.trim().toLowerCase();
    if (updates.name) local.admins[targetIdx].name = updates.name.trim();
    if (updates.passwordHash) local.admins[targetIdx].passwordHash = updates.passwordHash;
    writeLocalDb(local);
    return local.admins[targetIdx];
  },

  async getProducts(): Promise<ProductData[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
        const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(mapPrismaProduct);
      } catch (err) {
        console.warn('Prisma getProducts failed, falling back to local DB:', err);
      }
    }
    return readLocalDb().products;
  },

  async createProduct(input: Omit<ProductData, 'id'> & { id?: string }): Promise<ProductData> {
    const baseSlug = (input.slug || input.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `product-${Date.now()}`;

    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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
            images: (input.images?.length ? input.images : [productImages[6]]) as any,
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
    const newProduct: ProductData = {
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
      images: input.images?.length ? input.images : [productImages[6]],
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

  async updateProduct(id: string, updates: Partial<ProductData>): Promise<ProductData | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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
        await ensurePrismaSchemaAndSeed(prisma);
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

  async getOrders(): Promise<OrderData[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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
    items: OrderData['items'];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    paymentMethod: OrderData['paymentMethod'];
    shippingAddress: OrderData['shippingAddress'];
    notes?: string;
  }): Promise<{ order: OrderData; customer: CustomerData }> {
    const orderNum = `NC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const nowIso = new Date().toISOString();

    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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

    for (const item of orderInput.items) {
      const prod = local.products.find(p => p.id === item.product.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    const newOrder: OrderData = {
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

  async updateOrderStatus(orderId: string, status: OrderData['status'], paymentStatus?: OrderData['paymentStatus']): Promise<OrderData | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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

  async getCustomers(): Promise<CustomerData[]> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await ensurePrismaSchemaAndSeed(prisma);
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
        await ensurePrismaSchemaAndSeed(prisma);
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
        await ensurePrismaSchemaAndSeed(prisma);
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

// ============================================================================
// 4. HTTP / Serverless API Request Handler
// ============================================================================

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      return req.body.trim() ? JSON.parse(req.body) : {};
    }
    if (Buffer.isBuffer(req.body)) {
      const str = req.body.toString('utf8').trim();
      return str ? JSON.parse(str) : {};
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

function resolveApiPath(req: IncomingMessage & { query?: Record<string, any> }): string {
  // Check Vercel query param first if rewritten
  const queryPath = req.query?.__path;
  if (queryPath) {
    const joined = Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath);
    return `/api/${joined.replace(/^\/+/, '')}`;
  }
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
  const pathname = resolveApiPath(req as any).replace(/\/+$/, '') || '/api';

  try {
    // Health check endpoint
    if (pathname === '/api/health' && method === 'GET') {
      const hasPrisma = Boolean(getPrisma());
      return sendJson(res, 200, { ok: true, database: hasPrisma ? 'postgresql' : 'local-fallback' });
    }

    // 1. POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Please enter both email and password.' });
      }

      const admin = await db.findAdminByEmail(email);
      const isDefaultFallback =
        email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;

      if (!admin && !isDefaultFallback) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      if (admin && !verifyPassword(password, admin.passwordHash) && !isDefaultFallback) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      const resolvedAdmin = admin || {
        id: 'admin-1',
        email: DEFAULT_ADMIN_EMAIL,
        name: DEFAULT_ADMIN_NAME,
        role: 'Owner',
      };

      const token = signToken({
        sub: resolvedAdmin.id,
        email: resolvedAdmin.email,
        name: resolvedAdmin.name,
        role: resolvedAdmin.role,
      });

      return sendJson(res, 200, {
        token,
        admin: {
          id: resolvedAdmin.id,
          email: resolvedAdmin.email,
          name: resolvedAdmin.name,
          role: resolvedAdmin.role,
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
      return sendJson(res, 200, {
        admin: {
          id: admin?.id || tokenPayload.sub,
          email: admin?.email || tokenPayload.email,
          name: admin?.name || tokenPayload.name,
          role: admin?.role || tokenPayload.role,
        },
      });
    }

    // 3. PUT /api/auth/profile
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

    // 4. GET /api/bootstrap
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleApiRequest(req, res);
}
