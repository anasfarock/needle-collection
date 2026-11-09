import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../data/store';
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  {
    label: 'Kurtas',
    path: '/collections/men?sub=Kurta',
    children: [
      { label: 'Cotton Kurtas', path: '/collections/men?sub=Kurta' },
      { label: 'Winter Khaddar', path: '/collections/men?sub=Kurta' },
      { label: 'Waistcoats', path: '/collections/men?sub=Waistcoats' },
    ],
  },
  {
    label: 'Shalwar Kameez',
    path: '/collections/men?sub=Shalwar%20Kameez',
    children: [
      { label: 'Wash & Wear', path: '/collections/men?sub=Shalwar%20Kameez' },
      { label: 'Boski & Silk', path: '/collections/men?sub=Shalwar%20Kameez' },
      { label: 'Sherwani & Formal', path: '/collections/men?sub=Sherwani' },
      { label: 'Unstitched', path: '/collections/men?sub=Unstitched' },
    ],
  },
  { label: 'All Menswear', path: '/collections/men' },
  { label: 'New Arrivals', path: '/collections/new' },
  { label: 'Sale', path: '/collections/sale' },
];

export function StorefrontLayout() {
  const { cart, wishlist, products, siteContent } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    setMobileMenuOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const activeBanners = siteContent.banners.filter(b => b.active);
  const announcementText = activeBanners.length > 0
    ? `✦ ${activeBanners.map(b => b.text).join(' ✦ ')} ✦`
    : '✦ Free Delivery on Orders Above Rs. 3,000 ✦ Cash on Delivery Nationwide ✦ New Kurta Collection 2026 ✦';

  const searchResults = searchQuery.trim()
    ? products
        .filter(p => p.status === 'active' && (
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.fabric.toLowerCase().includes(searchQuery.toLowerCase())
        ))
        .slice(0, 6)
    : [];

  const headerBg = isHome && !scrolled ? 'bg-transparent' : 'bg-ivory/95 backdrop-blur-sm border-b border-hairline';
  const textColor = isHome && !scrolled ? 'text-white' : 'text-ink';

  return (
    <div className="min-h-screen bg-ivory">
      {/* Announcement Bar */}
      <div className="bg-parchment border-b border-hairline py-2 overflow-hidden h-[36px] flex items-center">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="text-[11px] uppercase tracking-[0.18em] text-stone mx-8">
            {announcementText}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-stone mx-8">
            {announcementText}
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
              {navItems.slice(0, 2).map(item => (
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
                          <Link key={child.label} to={child.path} className="block py-2 text-sm text-stone hover:text-oxblood transition-colors">
                            {child.label}
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
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`${textColor} hover:text-oxblood transition-colors`}
                title="Search catalog"
              >
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
            {navItems.slice(2).map(item => (
              <Link key={item.label} to={item.path}
                className={`text-[11px] uppercase tracking-[0.15em] font-medium hover:text-oxblood transition-colors ${textColor} ${item.label === 'Sale' ? 'text-terracotta' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="bg-ivory border-b border-hairline shadow-sm">
            <div className="max-w-3xl mx-auto px-6 py-4">
              <div className="flex items-center gap-3 border-b border-ink pb-2">
                <Search size={18} className="text-stone" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search kurtas, shalwar kameez, waistcoats, sherwani..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-ink outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-stone hover:text-ink">
                  <X size={18} />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="divide-y divide-hairline mt-3 max-h-80 overflow-auto">
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center justify-between py-2.5 hover:bg-parchment/50 px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-10 h-12 object-cover bg-parchment" />
                        <div>
                          <p className="text-sm text-ink font-medium">{p.title}</p>
                          <p className="text-xs text-stone">{p.subcategory} · {p.fabric}</p>
                        </div>
                      </div>
                      <span className="text-sm text-ink tabular-nums">Rs. {p.price.toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-xs text-stone py-3">No matching products found.</p>
              )}
            </div>
          </div>
        )}
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
                      <Link key={child.label} to={child.path} className="block py-2 text-sm text-stone">
                        {child.label}
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
              <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Shop Menswear</h4>
              <div className="space-y-3">
                {[
                  { label: 'Kurtas', path: '/collections/men?sub=Kurta' },
                  { label: 'Shalwar Kameez', path: '/collections/men?sub=Shalwar%20Kameez' },
                  { label: 'Waistcoats', path: '/collections/men?sub=Waistcoats' },
                  { label: 'Sherwani & Formal', path: '/collections/men?sub=Sherwani' },
                  { label: 'New Arrivals', path: '/collections/new' },
                  { label: 'Sale', path: '/collections/sale' },
                ].map(item => (
                  <Link key={item.label} to={item.path} className="block text-sm text-stone hover:text-oxblood transition-colors">{item.label}</Link>
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
