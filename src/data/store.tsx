import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface Product {
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

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: { product: Product; quantity: number; size: string; color: string; price: number }[];
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

export interface Customer {
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

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ContentBlock {
  id: string;
  type: 'hero' | 'collection_grid' | 'product_carousel' | 'editorial' | 'usp_strip' | 'newsletter';
  title: string;
  visible: boolean;
  content: Record<string, string>;
}

export interface BannerItem {
  id: string;
  text: string;
  active: boolean;
}

export interface SiteContent {
  blocks: ContentBlock[];
  banners: BannerItem[];
}

// Initial seed data
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

export const initialProducts: Product[] = [
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

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Ayesha Khan', phone: '0321-1234567', email: 'ayesha@email.com', city: 'Lahore', totalOrders: 5, totalSpent: 42500, createdAt: '2026-08-15', lastOrderAt: '2026-11-10' },
  { id: 'c2', name: 'Fatima Ahmed', phone: '0300-9876543', email: 'fatima@email.com', city: 'Karachi', totalOrders: 3, totalSpent: 28000, createdAt: '2026-09-01', lastOrderAt: '2026-11-08' },
  { id: 'c3', name: 'Muhammad Ali', phone: '0333-5551234', email: 'mali@email.com', city: 'Islamabad', totalOrders: 2, totalSpent: 8000, createdAt: '2026-09-20', lastOrderAt: '2026-10-30' },
  { id: 'c4', name: 'Sara Malik', phone: '0345-7778899', city: 'Faisalabad', totalOrders: 7, totalSpent: 65000, createdAt: '2026-07-01', lastOrderAt: '2026-11-12' },
  { id: 'c5', name: 'Hassan Raza', phone: '0312-4445566', email: 'hassan@email.com', city: 'Lahore', totalOrders: 1, totalSpent: 3200, createdAt: '2026-11-01', lastOrderAt: '2026-11-01' },
  { id: 'c6', name: 'Zainab Bibi', phone: '0301-2223344', city: 'Rawalpindi', totalOrders: 4, totalSpent: 35000, createdAt: '2026-08-20', lastOrderAt: '2026-11-05' },
  { id: 'c7', name: 'Usman Tariq', phone: '0322-8889900', email: 'usman@email.com', city: 'Multan', totalOrders: 2, totalSpent: 9600, createdAt: '2026-10-01', lastOrderAt: '2026-11-02' },
  { id: 'c8', name: 'Maryam Nawaz', phone: '0334-1112233', email: 'maryam@email.com', city: 'Lahore', totalOrders: 6, totalSpent: 78000, createdAt: '2026-06-15', lastOrderAt: '2026-11-11' },
];

export const initialOrders: Order[] = [
  {
    id: 'o1', orderNumber: 'NC-2026-0001',
    customer: initialCustomers[0],
    items: [{ product: initialProducts[0], quantity: 2, size: 'Unstitched', color: 'Ivory', price: 4500 }],
    subtotal: 9000, discount: 0, shipping: 200, total: 9200,
    status: 'delivered', paymentStatus: 'paid', paymentMethod: 'cod',
    shippingAddress: { name: 'Ayesha Khan', phone: '0321-1234567', email: 'ayesha@email.com', address: '45-B, Gulberg III', city: 'Lahore', area: 'Gulberg' },
    createdAt: '2026-11-01T10:30:00', updatedAt: '2026-11-05T14:00:00'
  },
  {
    id: 'o2', orderNumber: 'NC-2026-0002',
    customer: initialCustomers[1],
    items: [{ product: initialProducts[1], quantity: 1, size: 'Unstitched', color: 'Maroon', price: 18500 }],
    subtotal: 18500, discount: 1850, shipping: 0, total: 16650,
    status: 'shipped', paymentStatus: 'paid', paymentMethod: 'jazzcash',
    shippingAddress: { name: 'Fatima Ahmed', phone: '0300-9876543', address: '12 Clifton Block 4', city: 'Karachi', area: 'Clifton' },
    createdAt: '2026-11-08T15:20:00', updatedAt: '2026-11-10T09:00:00'
  },
  {
    id: 'o3', orderNumber: 'NC-2026-0003',
    customer: initialCustomers[3],
    items: [
      { product: initialProducts[4], quantity: 1, size: 'Unstitched', color: 'Red', price: 45000 },
      { product: initialProducts[7], quantity: 1, size: 'Unstitched', color: 'Rust', price: 5500 },
    ],
    subtotal: 50500, discount: 5050, shipping: 0, total: 45450,
    status: 'confirmed', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Sara Malik', phone: '0345-7778899', address: '78 Peoples Colony', city: 'Faisalabad', area: 'Peoples Colony' },
    createdAt: '2026-11-12T08:45:00', updatedAt: '2026-11-12T09:00:00'
  },
  {
    id: 'o4', orderNumber: 'NC-2026-0004',
    customer: initialCustomers[2],
    items: [{ product: initialProducts[2], quantity: 1, size: 'L', color: 'White', price: 3200 }],
    subtotal: 3200, discount: 0, shipping: 200, total: 3400,
    status: 'packed', paymentStatus: 'paid', paymentMethod: 'card',
    shippingAddress: { name: 'Muhammad Ali', phone: '0333-5551234', email: 'mali@email.com', address: 'F-7/2, Street 15', city: 'Islamabad', area: 'F-7' },
    createdAt: '2026-11-11T12:00:00', updatedAt: '2026-11-12T10:00:00'
  },
  {
    id: 'o5', orderNumber: 'NC-2026-0005',
    customer: initialCustomers[4],
    items: [{ product: initialProducts[5], quantity: 2, size: 'L', color: 'White', price: 4800 }],
    subtotal: 9600, discount: 0, shipping: 200, total: 9800,
    status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Hassan Raza', phone: '0312-4445566', address: '23 Model Town', city: 'Lahore', area: 'Model Town' },
    createdAt: '2026-11-12T16:30:00', updatedAt: '2026-11-12T16:30:00'
  },
  {
    id: 'o6', orderNumber: 'NC-2026-0006',
    customer: initialCustomers[7],
    items: [{ product: initialProducts[1], quantity: 1, size: 'Unstitched', color: 'Navy', price: 18500 }],
    subtotal: 18500, discount: 0, shipping: 0, total: 18500,
    status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cod',
    shippingAddress: { name: 'Maryam Nawaz', phone: '0334-1112233', email: 'maryam@email.com', address: '88 MM Alam Road', city: 'Lahore', area: 'Gulberg' },
    createdAt: '2026-11-12T18:00:00', updatedAt: '2026-11-12T18:00:00'
  },
];

const initialSiteContent: SiteContent = {
  blocks: [
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
  ],
  banners: [
    { id: 'b1', text: 'Free Delivery on Orders Above Rs. 3,000', active: true },
    { id: 'b2', text: 'Cash on Delivery Nationwide', active: true },
    { id: 'b3', text: 'New Kurta Collection 2026', active: true },
    { id: 'b4', text: 'Premium Shalwar Kameez', active: true },
    { id: 'b5', text: 'Easy Returns Within 7 Days', active: true },
  ],
};

const TOKEN_STORAGE_KEY = 'nc_admin_token';
const ADMIN_USER_KEY = 'nc_admin_user';
const LOCAL_CREDS_KEY = 'nc_admin_creds';
const PRODUCTS_CACHE_KEY = 'nc_products_cache_v2';
const ORDERS_CACHE_KEY = 'nc_orders_cache';
const CUSTOMERS_CACHE_KEY = 'nc_customers_cache';
const CONTENT_CACHE_KEY = 'nc_content_cache';
const CART_STORAGE_KEY = 'nc_cart';
const WISHLIST_STORAGE_KEY = 'nc_wishlist';

// Context
interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  siteContent: SiteContent;
  cart: CartItem[];
  wishlist: string[];
  isAdmin: boolean;
  authLoading: boolean;
  dataLoading: boolean;
  adminUser: AdminProfile | null;
  setIsAdmin: (v: boolean) => void;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => void;
  updateAdminProfile: (updates: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<{ ok: boolean; error?: string }>;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateCartQuantity: (productId: string, qty: number, size?: string, color?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: Order) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateSiteContent: (updates: Partial<SiteContent>) => Promise<void>;
  refreshData: () => Promise<void>;
  getStats: () => DashboardStats;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function safeParseJsonResponse(res: Response): Promise<{ isJson: boolean; data: any }> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return { isJson: true, data };
    } catch {
      return { isJson: false, data: null };
    }
  }
  return { isJson: false, data: null };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => readJsonStorage(PRODUCTS_CACHE_KEY, initialProducts));
  const [orders, setOrders] = useState<Order[]>(() => readJsonStorage(ORDERS_CACHE_KEY, initialOrders));
  const [customers, setCustomers] = useState<Customer[]>(() => readJsonStorage(CUSTOMERS_CACHE_KEY, initialCustomers));
  const [siteContent, setSiteContent] = useState<SiteContent>(() => readJsonStorage(CONTENT_CACHE_KEY, initialSiteContent));
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>(() => readJsonStorage(CART_STORAGE_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readJsonStorage(WISHLIST_STORAGE_KEY, []));

  const [isAdmin, setIsAdminState] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    try { localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products)); } catch {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orders)); } catch {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(customers)); } catch {}
  }, [customers]);

  useEffect(() => {
    try { localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(siteContent)); } catch {}
  }, [siteContent]);

  useEffect(() => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data) {
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (data.content) setSiteContent(data.content);
      }
    } catch (err) {
      console.warn('Could not fetch /api/bootstrap, using cached store state:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const cachedUser = readJsonStorage<AdminProfile | null>(ADMIN_USER_KEY, null);
    if (!token) {
      setAuthLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        const { isJson, data } = await safeParseJsonResponse(res);
        if (res.ok && isJson && data?.admin) {
          setAdminUser(data.admin);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
          setIsAdminState(true);
        } else if (res.status === 401 && isJson) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(ADMIN_USER_KEY);
          setAdminUser(null);
          setIsAdminState(false);
        } else if (cachedUser) {
          setAdminUser(cachedUser);
          setIsAdminState(true);
        }
      })
      .catch(() => {
        if (cachedUser) {
          setAdminUser(cachedUser);
          setIsAdminState(true);
        }
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [refreshData]);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const { isJson, data } = await safeParseJsonResponse(res);

      if (isJson) {
        if (!res.ok) {
          return { ok: false, error: data?.error || 'Invalid email or password.' };
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
        setAdminUser(data.admin);
        setIsAdminState(true);
        await refreshData();
        return { ok: true };
      }
    } catch (err) {
      console.warn('API login unreachable, checking local fallback credentials:', err);
    }

    // Fallback check if serverless function was unreachable
    const savedCreds = readJsonStorage(LOCAL_CREDS_KEY, {
      email: 'admin@needlecollection.com',
      password: 'password123',
      name: 'Admin User',
      role: 'Owner',
    });

    if (normalizedEmail === savedCreds.email.toLowerCase() && password === savedCreds.password) {
      const admin: AdminProfile = {
        id: 'admin-1',
        email: savedCreds.email,
        name: savedCreds.name,
        role: savedCreds.role,
      };
      localStorage.setItem(TOKEN_STORAGE_KEY, `local-token-${Date.now()}`);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
      setAdminUser(admin);
      setIsAdminState(true);
      return { ok: true };
    }

    return { ok: false, error: 'Invalid email or password.' };
  }, [refreshData]);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdminUser(null);
    setIsAdminState(false);
  }, []);

  const setIsAdmin = useCallback((v: boolean) => {
    if (!v) {
      logoutAdmin();
    } else {
      setIsAdminState(true);
    }
  }, [logoutAdmin]);

  const updateAdminProfile = useCallback(async (updates: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (isJson) {
        if (!res.ok) {
          return { ok: false, error: data?.error || 'Failed to update profile.' };
        }
        if (data.token) localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        if (data.admin) {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
          setAdminUser(data.admin);
        }
        return { ok: true };
      }
    } catch {
      // Fallback to local update below
    }

    const savedCreds = readJsonStorage(LOCAL_CREDS_KEY, {
      email: 'admin@needlecollection.com',
      password: 'password123',
      name: 'Admin User',
      role: 'Owner',
    });
    if (updates.newPassword && updates.currentPassword !== savedCreds.password) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    const nextCreds = {
      ...savedCreds,
      name: updates.name || savedCreds.name,
      email: updates.email ? updates.email.toLowerCase() : savedCreds.email,
      password: updates.newPassword || savedCreds.password,
    };
    localStorage.setItem(LOCAL_CREDS_KEY, JSON.stringify(nextCreds));
    const nextAdmin: AdminProfile = {
      id: 'admin-1',
      email: nextCreds.email,
      name: nextCreds.name,
      role: nextCreds.role,
    };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(nextAdmin));
    setAdminUser(nextAdmin);
    return { ok: true };
  }, []);

  const addToCart = useCallback((product: Product, size: string, color: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size && i.color === color);
      if (existing) {
        return prev.map(i => i.product.id === product.id && i.size === size && i.color === color
          ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1, size, color }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size?: string, color?: string) => {
    setCart(prev => prev.filter(i => {
      if (i.product.id !== productId) return true;
      if (size && i.size !== size) return true;
      if (color && i.color !== color) return true;
      return false;
    }));
  }, []);

  const updateCartQuantity = useCallback((productId: string, qty: number, size?: string, color?: string) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
    } else {
      setCart(prev => prev.map(i => {
        if (i.product.id === productId && (!size || i.size === size) && (!color || i.color === color)) {
          return { ...i, quantity: qty };
        }
        return i;
      }));
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, []);

  const addOrder = useCallback(async (order: Order): Promise<Order> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.customer,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          total: order.total,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          notes: order.notes,
        }),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data?.order) {
        setOrders(prev => [data.order, ...prev]);
        if (data.customer) {
          setCustomers(prev => {
            const exists = prev.some(c => c.id === data.customer.id || c.phone === data.customer.phone);
            return exists
              ? prev.map(c => (c.id === data.customer.id || c.phone === data.customer.phone ? data.customer : c))
              : [data.customer, ...prev];
          });
        }
        refreshData();
        return data.order;
      }
    } catch (err) {
      console.warn('Order API fallback to local state:', err);
    }
    setOrders(prev => [order, ...prev]);
    return order;
  }, [refreshData]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status,
      ...(paymentStatus ? { paymentStatus } : status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      updatedAt: new Date().toISOString(),
    } : o));

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, paymentStatus }),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data?.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } catch (err) {
      console.warn('Failed to persist order status update:', err);
    }
  }, []);

  const addProduct = useCallback(async (productInput: Omit<Product, 'id'> & { id?: string }): Promise<Product> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productInput),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data?.product) {
        setProducts(prev => [data.product, ...prev]);
        return data.product;
      }
    } catch (err) {
      console.warn('Failed to create product via API, using fallback:', err);
    }
    const fallback: Product = {
      ...productInput,
      id: productInput.id || `p${Date.now()}`,
    };
    setProducts(prev => [fallback, ...prev]);
    return fallback;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data?.product) {
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
      }
    } catch (err) {
      console.warn('Failed to update product via API:', err);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Failed to delete product via API:', err);
    }
  }, []);

  const updateSiteContent = useCallback(async (updates: Partial<SiteContent>) => {
    setSiteContent(prev => ({ ...prev, ...updates }));
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const { isJson, data } = await safeParseJsonResponse(res);
      if (res.ok && isJson && data?.content) {
        setSiteContent(data.content);
      }
    } catch (err) {
      console.warn('Failed to update site content via API:', err);
    }
  }, []);

  const getStats = useCallback((): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
    return {
      todaySales,
      todayOrders: todayOrders.length,
      pendingOrders,
      totalCustomers: customers.length,
      totalRevenue,
      conversionRate: 3.2,
    };
  }, [orders, customers]);

  return (
    <StoreContext.Provider value={{
      products, orders, customers, siteContent, cart, wishlist,
      isAdmin, authLoading, dataLoading, adminUser,
      setIsAdmin, loginAdmin, logoutAdmin, updateAdminProfile,
      addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist,
      addOrder, updateOrderStatus, addProduct, updateProduct, deleteProduct,
      updateSiteContent, refreshData, getStats,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
