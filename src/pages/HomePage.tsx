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
      <section className="relative h-[92vh] min-h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://image.qwenlm.ai/generated-images/925023d5-7755-4596-9094-8fcf93f81fe9/_result.png"
            alt="Needle Collection — Men's Ethnic Wear"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 w-full">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-ivory/70 mb-4 animate-fade-in-up">The Gentleman's Edit — 2026</p>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory leading-[0.9] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Crafted for<br />
              <em className="font-light">the Modern Man</em>
            </h2>
            <p className="text-ivory/80 text-lg mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Shalwar kameez, kurtas, and waistcoats — tailored with heritage craftsmanship for the man who commands every room he enters.
            </p>
            <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/collections/men" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ivory hover:text-oxblood transition-smooth">
                Shop Men <ArrowRight size={14} />
              </Link>
              <Link to="/collections/women" className="inline-flex items-center gap-2 border border-ivory/40 text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ivory hover:text-ink transition-smooth">
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tiles — Men First */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {/* Men — Large */}
          <Link to="/collections/men" className="group relative overflow-hidden block md:col-span-7 aspect-[4/5] md:aspect-auto">
            <img
              src="https://image.qwenlm.ai/generated-images/bd78c216-4a27-46e3-8267-b80e509e5a0d/_result.png"
              alt="Men's Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 lg:p-8">
              <h3 className="font-display text-3xl lg:text-4xl text-ivory mb-1">Men</h3>
              <p className="text-ivory/70 text-sm">Kurta · Shalwar Kameez · Waistcoats</p>
              <span className="inline-flex items-center gap-2 mt-4 text-[11px] uppercase tracking-[0.15em] text-ivory group-hover:gap-3 transition-all">
                Explore <ArrowRight size={12} />
              </span>
            </div>
          </Link>

          {/* Women + Kids stacked */}
          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4 lg:gap-6">
            <Link to="/collections/women" className="group relative overflow-hidden block aspect-[4/3] md:aspect-auto md:flex-1">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop"
                alt="Women's Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-2xl lg:text-3xl text-ivory mb-1">Women</h3>
                <p className="text-ivory/70 text-sm">Unstitched & Ready to Wear</p>
              </div>
            </Link>
            <Link to="/collections/kids" className="group relative overflow-hidden block aspect-[4/3] md:aspect-auto md:flex-1">
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop"
                alt="Kids Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-2xl lg:text-3xl text-ivory mb-1">Kids</h3>
                <p className="text-ivory/70 text-sm">Festive & Party Wear</p>
              </div>
            </Link>
          </div>
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

      {/* Editorial Split — Men's Wedding/Formal */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="relative overflow-hidden aspect-[4/5] lg:aspect-auto order-2 lg:order-1">
            <img
              src="https://image.qwenlm.ai/generated-images/d7dbc5a0-8b94-4ff8-aef9-74243537684f/_result.png"
              alt="Wedding Collection"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center p-8 lg:p-16 bg-parchment order-1 lg:order-2">
            <div className="max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brass mb-4">The Wedding Edit</p>
              <h2 className="font-display text-4xl lg:text-5xl mb-6 leading-tight">
                Command the<br /><em className="font-light">Grandest Day</em>
              </h2>
              <p className="text-stone leading-relaxed mb-8">
                From your nikah to the walima, our sherwani and formal collection is crafted for the man who understands that tradition is the ultimate sophistication. Hand-embroidered, regal, unforgettable.
              </p>
              <Link to="/collections/men" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth">
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Men's Featured Section */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Signature Pieces</p>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">The Essentials</h2>
          <p className="text-stone max-w-lg mx-auto">
            Timeless silhouettes in premium fabrics — every man's wardrobe deserves these foundations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Classic Kurta', desc: 'Premium cotton, everyday elegance', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop', link: '/collections/men' },
            { title: 'Shalwar Kameez', desc: 'Wash & wear, wrinkle-resistant', img: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop', link: '/collections/men' },
            { title: 'Waistcoats', desc: 'Layered sophistication', img: 'https://images.unsplash.com/photo-1570382667048-23b581951c33?w=600&h=800&fit=crop', link: '/collections/men' },
          ].map((item, i) => (
            <Link key={i} to={item.link} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-parchment mb-4">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-display text-2xl mb-1 group-hover:text-oxblood transition-colors">{item.title}</h3>
              <p className="text-sm text-stone">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Sale Section */}
      <section className="bg-parchment py-24 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
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
        </div>
      </section>

      {/* USP Strip */}
      <section className="border-y border-hairline">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-hairline">
            {[
              { icon: Truck, title: 'Cash on Delivery', sub: 'Pay when you receive' },
              { icon: Shield, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: Award, title: 'Premium Tailoring', sub: 'Master craftsmen' },
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
        <h2 className="font-display text-4xl lg:text-5xl mb-4">Join the Inner Circle</h2>
        <p className="text-stone max-w-md mx-auto mb-8">
          Be the first to access new collections, private sales, and style guides crafted for the modern gentleman.
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
