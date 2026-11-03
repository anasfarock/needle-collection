import { Link } from 'react-router-dom';
import { useStore } from '../data/store';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Truck, Shield, Award, MapPin } from 'lucide-react';

export function HomePage() {
  const { products } = useStore();
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const saleItems = products.filter(p => p.isSale).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&h=1000&fit=crop"
            alt="Summer Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 w-full">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-ivory/70 mb-4 animate-fade-in-up">Summer 2026</p>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory leading-[0.9] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The Art of<br />
              <em className="font-light">Elegance</em>
            </h2>
            <p className="text-ivory/80 text-lg mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Discover our summer lawn collection — where heritage craftsmanship meets contemporary design.
            </p>
            <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/collections/women" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ivory hover:text-oxblood transition-smooth">
                Shop Women <ArrowRight size={14} />
              </Link>
              <Link to="/collections/men" className="inline-flex items-center gap-2 border border-ivory/40 text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ivory hover:text-ink transition-smooth">
                Shop Men
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tiles */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[
            { title: 'Women', subtitle: 'Unstitched & Ready to Wear', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop', path: '/collections/women' },
            { title: 'Men', subtitle: 'Kurta & Shalwar Kameez', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=600&fit=crop', path: '/collections/men' },
            { title: 'Kids', subtitle: 'Festive & Party Wear', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop', path: '/collections/kids' },
          ].map((cat, i) => (
            <Link key={cat.title} to={cat.path} className={`group relative overflow-hidden block ${i === 0 ? 'md:row-span-2 md:aspect-[3/5]' : 'aspect-[4/3]'}`}>
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 lg:p-8">
                <h3 className="font-display text-3xl lg:text-4xl text-ivory mb-1">{cat.title}</h3>
                <p className="text-ivory/70 text-sm">{cat.subtitle}</p>
                <span className="inline-flex items-center gap-2 mt-4 text-[11px] uppercase tracking-[0.15em] text-ivory group-hover:gap-3 transition-all">
                  Explore <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-24 lg:pb-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Just Landed</p>
            <h2 className="font-display text-4xl lg:text-5xl">New Arrivals</h2>
          </div>
          <Link to="/collections/new" className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Split */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="relative overflow-hidden aspect-[4/5] lg:aspect-auto">
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&h=1200&fit=crop"
              alt="Wedding Collection"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center p-8 lg:p-16 bg-parchment">
            <div className="max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brass mb-4">The Wedding Edit</p>
              <h2 className="font-display text-4xl lg:text-5xl mb-6 leading-tight">
                Celebrate in<br /><em className="font-light">Timeless Beauty</em>
              </h2>
              <p className="text-stone leading-relaxed mb-8">
                From intimate nikah ceremonies to grand walima receptions, our bridal and formal collection captures the grandeur of Pakistani weddings with hand-embroidered organza, intricate zardozi work, and luxurious fabrics.
              </p>
              <Link to="/collections/women" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth">
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sale Section */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-terracotta mb-2">Limited Time</p>
            <h2 className="font-display text-4xl lg:text-5xl">On Sale</h2>
          </div>
          <Link to="/collections/sale" className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {saleItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* USP Strip */}
      <section className="border-y border-hairline">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-hairline">
            {[
              { icon: Truck, title: 'Cash on Delivery', sub: 'Pay when you receive' },
              { icon: Shield, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: Award, title: 'Authentic Craft', sub: 'Handmade with care' },
              { icon: MapPin, title: 'Nationwide Delivery', sub: 'All across Pakistan' },
            ].map((usp, i) => (
              <div key={i} className="flex items-center gap-4 py-8 px-4 lg:px-8">
                <usp.icon size={24} className="text-oxblood shrink-0" />
                <div>
                  <p className="text-sm font-medium">{usp.title}</p>
                  <p className="text-xs text-stone">{usp.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24 lg:py-32 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass mb-4">Stay Connected</p>
        <h2 className="font-display text-4xl lg:text-5xl mb-4">Join Our World</h2>
        <p className="text-stone max-w-md mx-auto mb-8">
          Subscribe for early access to new collections, exclusive offers, and style inspiration.
        </p>
        <div className="max-w-md mx-auto flex border-b border-ink">
          <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone/50" />
          <button className="text-[11px] uppercase tracking-[0.15em] font-medium hover:text-oxblood transition-colors px-4">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
