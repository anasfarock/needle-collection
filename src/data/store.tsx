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
    category: 'Men', subcategory: 'Formal', fabric: 'Silk Blend', season: 'Winter',
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
    id: '7', slug: 'kids-kurta-shalwar', title: 'Little Sahab Set', subtitle: 'Boys Kurta Shalwar',
    description: 'Adorable mini kurta shalwar set for young gentlemen. Premium cotton with subtle embroidery on the collar. Soft, comfortable, and perfect for Eid and family gatherings.',
    category: 'Kids', subcategory: 'Ready to Wear', fabric: 'Cotton', season: 'All',
    status: 'active', price: 2200,
    images: [productImages[3], productImages[8]],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Cream', hex: '#F5E6D3' }, { name: 'Sky', hex: '#87CEEB' }],
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'], stock: 34, publishedAt: '2026-11-10'
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
    id: '9', slug: 'noor-lawn-3-piece', title: 'Noor Lawn Collection', subtitle: 'Women\'s Embroidered 3-Piece',
    description: 'Exquisite lawn ensemble featuring intricate thread embroidery on the front panel, paired with a digitally printed dupatta and dyed trousers.',
    category: 'Women', subcategory: 'Unstitched', fabric: 'Lawn', season: 'Summer',
    status: 'active', price: 4500, compareAtPrice: 5800,
    images: [productImages[0], productImages[2], productImages[4]],
    colors: [{ name: 'Ivory', hex: '#F6F1E9' }, { name: 'Blush', hex: '#E8C4C4' }, { name: 'Sage', hex: '#6F7A63' }],
    sizes: ['Unstitched'], stock: 45, isSale: true, publishedAt: '2026-11-01'
  },
  {
    id: '10', slug: 'zara-formal-chiffon', title: 'Zara Formal Chiffon', subtitle: 'Women\'s Heavy Embroidered',
    description: 'Luxurious chiffon formal wear with heavy hand embroidery, sequin work and stone detailing.',
    category: 'Women', subcategory: 'Formal', fabric: 'Chiffon', season: 'Winter',
    status: 'active', price: 18500,
    images: [productImages[3], productImages[4], productImages[5]],
    colors: [{ name: 'Maroon', hex: '#5A1F26' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Emerald', hex: '#2D5A3D' }],
    sizes: ['Unstitched'], stock: 12, publishedAt: '2026-11-05'
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
