import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

// Mock data
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
    id: '1', slug: 'noor-lawn-3-piece', title: 'Noor Lawn Collection', subtitle: 'Embroidered 3-Piece',
    description: 'Exquisite lawn ensemble featuring intricate thread embroidery on the front panel, paired with a digitally printed dupatta and dyed trousers. Crafted from premium breathable lawn for summer elegance.',
    category: 'Women', subcategory: 'Unstitched', fabric: 'Lawn', season: 'Summer',
    status: 'active', price: 4500, compareAtPrice: 5800,
    images: [productImages[0], productImages[1], productImages[2]],
    colors: [{ name: 'Ivory', hex: '#F6F1E9' }, { name: 'Blush', hex: '#E8C4C4' }, { name: 'Sage', hex: '#6F7A63' }],
    sizes: ['Unstitched'], stock: 45, isNew: true, isSale: true, publishedAt: '2026-11-01'
  },
  {
    id: '2', slug: 'zara-formal-chiffon', title: 'Zara Formal Chiffon', subtitle: 'Heavy Embroidered',
    description: 'Luxurious chiffon formal wear with heavy hand embroidery, sequin work and stone detailing. Includes embroidered shirt, dupatta with border, and dyed trouser fabric.',
    category: 'Women', subcategory: 'Formal', fabric: 'Chiffon', season: 'Winter',
    status: 'active', price: 18500,
    images: [productImages[3], productImages[4], productImages[5]],
    colors: [{ name: 'Maroon', hex: '#5A1F26' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Emerald', hex: '#2D5A3D' }],
    sizes: ['Unstitched'], stock: 12, isNew: true, publishedAt: '2026-11-05'
  },
  {
    id: '3', slug: 'classic-kurta-men', title: 'Heritage Kurta', subtitle: 'Men\'s Premium Cotton',
    description: 'Classic straight-cut kurta in premium cotton with subtle texture weave. Side slits, mother-of-pearl buttons, and a relaxed fit perfect for everyday elegance.',
    category: 'Men', subcategory: 'Kurta', fabric: 'Cotton', season: 'All',
    status: 'active', price: 3200,
    images: [productImages[6], productImages[7]],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Cream', hex: '#F5E6D3' }, { name: 'Charcoal', hex: '#36454F' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 78, publishedAt: '2026-10-15'
  },
  {
    id: '4', slug: 'gulbahar-lawn-2piece', title: 'Gulbahar Lawn', subtitle: 'Printed 2-Piece',
    description: 'Fresh floral prints on premium lawn fabric. Shirt piece with all-over digital print and matching dyed trouser. Light, breathable, perfect for daily wear.',
    category: 'Women', subcategory: 'Unstitched', fabric: 'Lawn', season: 'Summer',
    status: 'active', price: 2800,
    images: [productImages[8], productImages[9]],
    colors: [{ name: 'Sky', hex: '#87CEEB' }, { name: 'Peach', hex: '#FFCBA4' }, { name: 'Mint', hex: '#98FF98' }],
    sizes: ['Unstitched'], stock: 120, publishedAt: '2026-10-20'
  },
  {
    id: '5', slug: 'wedding-organza', title: 'Shaan-e-Mehfil', subtitle: 'Bridal Organza Set',
    description: 'Exquisite bridal ensemble in pure organza with heavy zardozi, dabka and sequin work. Includes heavily embroidered shirt, dupatta with four-side border, and trouser.',
    category: 'Women', subcategory: 'Formal', fabric: 'Organza', season: 'Winter',
    status: 'active', price: 45000, compareAtPrice: 55000,
    images: [productImages[10], productImages[11], productImages[0]],
    colors: [{ name: 'Red', hex: '#8B0000' }, { name: 'Gold', hex: '#DAA520' }],
    sizes: ['Unstitched'], stock: 5, isSale: true, publishedAt: '2026-09-01'
  },
  {
    id: '6', slug: 'shalwar-kameez-men', title: 'Classic Shalwar Kameez', subtitle: 'Men\'s Wash & Wear',
    description: 'Traditional shalwar kameez in premium wash & wear fabric. Wrinkle-resistant, comfortable fit with a modern silhouette. Perfect for formal and casual occasions.',
    category: 'Men', subcategory: 'Shalwar Kameez', fabric: 'Wash & Wear', season: 'All',
    status: 'active', price: 4800,
    images: [productImages[1], productImages[6]],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Off-White', hex: '#FAF0E6' }, { name: 'Light Grey', hex: '#D3D3D3' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 55, publishedAt: '2026-10-01'
  },
  {
    id: '7', slug: 'kids-frocks', title: 'Little Noor Frocks', subtitle: 'Girls Party Wear',
    description: 'Adorable party frock for little ones with delicate embroidery and net overlay. Soft cotton lining for comfort. Available in multiple colors.',
    category: 'Kids', subcategory: 'Ready to Wear', fabric: 'Net', season: 'All',
    status: 'active', price: 2200,
    images: [productImages[3], productImages[8]],
    colors: [{ name: 'Pink', hex: '#FFB6C1' }, { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Mint', hex: '#98FB98' }],
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'], stock: 34, isNew: true, publishedAt: '2026-11-10'
  },
  {
    id: '8', slug: 'kamrez-khaddar', title: 'Kamrez Khaddar', subtitle: 'Winter 3-Piece',
    description: 'Warm khaddar ensemble with embroidered front, printed back and sleeves. Includes embroidered dupatta with border and dyed trousers. Perfect winter essential.',
    category: 'Women', subcategory: 'Unstitched', fabric: 'Khaddar', season: 'Winter',
    status: 'active', price: 5500,
    images: [productImages[5], productImages[9], productImages[2]],
    colors: [{ name: 'Rust', hex: '#9C3B2A' }, { name: 'Mustard', hex: '#DAA520' }, { name: 'Olive', hex: '#6F7A63' }],
    sizes: ['Unstitched'], stock: 67, publishedAt: '2026-10-25'
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

// Context
interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  cart: CartItem[];
  wishlist: string[];
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getStats: () => DashboardStats;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
      products, orders, customers, cart, wishlist, isAdmin, setIsAdmin,
      addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist,
      addOrder, updateOrderStatus, addProduct, updateProduct, deleteProduct, getStats
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
