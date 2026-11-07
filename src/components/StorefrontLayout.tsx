import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../data/store';
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'Men', path: '/collections/men', children: ['Kurta', 'Shalwar Kameez', 'Waistcoats', 'Unstitched', 'Sherwani'] },
  { label: 'Women', path: '/collections/women', children: ['Unstitched', 'Ready to Wear', 'Formal & Festive', 'Dupattas & Shawls'] },
  { label: 'Kids', path: '/collections/kids', children: ['Boys', 'Girls', 'Infants'] },
  { label: 'Collections', path: '/collections/all', children: ['Summer Lawn', 'Winter', 'Festive & Eid', 'Wedding'] },
  { label: 'New Arrivals', path: '/collections/new' },
  { label: 'Sale', path: '/collections/sale' },
];

export function StorefrontLayout() {
  const { cart, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMega(null);
  }, [location]);

  const headerBg = isHome && !scrolled ? 'bg-transparent' : 'bg-ivory/95 backdrop-blur-sm border-b border-hairline';
  const textColor = isHome && !scrolled ? 'text-white' : 'text-ink';

  return (
    <div className="min-h-screen bg-ivory">
      {/* Announcement Bar */}
      <div className="bg-parchment border-b border-hairline py-2 overflow-hidden h-[36px] flex items-center">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="text-[11px] uppercase tracking-[0.18em] text-stone mx-8">
            ✦ Free Delivery on Orders Above Rs. 3,000 ✦ Cash on Delivery Nationwide ✦ New Kurta Collection 2026 ✦ Premium Shalwar Kameez ✦ Easy Returns Within 7 Days ✦
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-stone mx-8">
            ✦ Free Delivery on Orders Above Rs. 3,000 ✦ Cash on Delivery Nationwide ✦ New Kurta Collection 2026 ✦ Premium Shalwar Kameez ✦ Easy Returns Within 7 Days ✦
          </span>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'top-0' : 'top-[36px]'} ${headerBg}`}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden ${textColor}`}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.slice(0, 3).map(item => (
                <div key={item.label} className="relative"
                  onMouseEnter={() => item.children && setActiveMega(item.label)}
                  onMouseLeave={() => setActiveMega(null)}>
                  <Link to={item.path} className={`text-[12px] uppercase tracking-[0.15em] font-medium hover:text-oxblood transition-colors flex items-center gap-1 ${textColor}`}>
                    {item.label}
                    {item.children && <ChevronDown size={12} />}
                  </Link>
                  {item.children && activeMega === item.label && (
                    <div className="absolute top-full left-0 pt-4 w-56 animate-fade-in-up">
                      <div className="bg-ivory border border-hairline p-6">
                        {item.children.map(child => (
                          <Link key={child} to={`${item.path}`} className="block py-2 text-sm text-stone hover:text-oxblood transition-colors">
                            {child}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className={`font-display text-2xl lg:text-3xl tracking-[0.2em] uppercase ${textColor} transition-colors`}>
                Needle Collection
              </h1>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-5">
              <button className={`hidden lg:block ${textColor} hover:text-oxblood transition-colors`}>
                <Search size={20} />
              </button>
              <Link to="/cart" className={`relative ${textColor} hover:text-oxblood transition-colors`}>
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-oxblood text-white text-[9px] rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className={`relative ${textColor} hover:text-oxblood transition-colors`}>
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-oxblood text-white text-[9px] rounded-full flex items-center justify-center">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop nav row 2 */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-3">
            {navItems.slice(3).map(item => (
              <Link key={item.label} to={item.path}
                className={`text-[11px] uppercase tracking-[0.15em] font-medium hover:text-oxblood transition-colors ${textColor} ${item.label === 'Sale' ? 'text-terracotta' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-ivory pt-24 px-6 overflow-auto">
          <nav className="space-y-1">
            {navItems.map(item => (
              <div key={item.label}>
                <Link to={item.path} className="block py-3 text-lg font-display tracking-wide border-b border-hairline">
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 pb-2">
                    {item.children.map(child => (
                      <Link key={child} to={item.path} className="block py-2 text-sm text-stone">
                        {child}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-parchment border-t border-hairline mt-24">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-2xl tracking-[0.15em] uppercase mb-6">Needle Collection</h3>
              <p className="text-sm text-stone leading-relaxed">
                Premium ethnic wear for the modern gentleman. Heritage craftsmanship meets contemporary design — shalwar kameez, kurtas, and waistcoats tailored for those who understand tradition.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Shop</h4>
              <div className="space-y-3">
                {['Men', 'Women', 'Kids', 'New Arrivals', 'Sale'].map(item => (
                  <Link key={item} to={`/collections/${item.toLowerCase()}`} className="block text-sm text-stone hover:text-oxblood transition-colors">{item}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Help</h4>
              <div className="space-y-3">
                {['Size Guide', 'Shipping & Returns', 'Track Order', 'FAQs', 'Contact Us'].map(item => (
                  <a key={item} href="#" className="block text-sm text-stone hover:text-oxblood transition-colors">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Newsletter</h4>
              <p className="text-sm text-stone mb-4">Be the first to know about new collections and exclusive offers.</p>
              <div className="flex border-b border-ink">
                <input type="email" placeholder="Your email" className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-stone/50" />
                <button className="text-[11px] uppercase tracking-[0.15em] font-medium hover:text-oxblood transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-hairline mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-stone">© 2026 Needle Collection. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map(item => (
                <a key={item} href="#" className="text-xs text-stone hover:text-oxblood transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
