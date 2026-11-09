import { initialProducts, initialCustomers, initialOrders } from '../data/store';

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@needlecollection.com';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
export const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

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

export { initialProducts, initialCustomers, initialOrders };

