import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../data/store';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, ChevronRight, Truck, RotateCcw, Share2, Minus, Plus, Check } from 'lucide-react';

export function ProductPage() {
  const { slug } = useParams();
  const { products, addToCart, wishlist, toggleWishlist } = useStore();
  const product = products.find(p => p.slug === slug);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Scroll to top and reset selection state whenever the product changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    setSelectedColor(0);
    setSelectedSize(product?.sizes?.[0] || '');
    setQuantity(1);
    setActiveImg(0);
    setAddedToBag(false);
  }, [slug, product?.id]);

  if (!product) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
        <Link to="/" className="text-oxblood underline">Return Home</Link>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const related = products.filter(p => p.status === 'active' && p.category === product.category && p.id !== product.id).slice(0, 4);
  const activeSize = selectedSize || product.sizes[0] || 'Standard';

  const handleAddToCart = () => {
    const size = activeSize;
    const color = product.colors[selectedColor]?.name || 'Default';
    for (let i = 0; i < quantity; i++) {
      addToCart(product, size, color);
    }
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 1800);
  };

  return (
    <div className="pt-24 lg:pt-28">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-4">
        <div className="flex items-center gap-2 text-xs text-stone">
          <Link to="/" className="hover:text-oxblood transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/collections/men" className="hover:text-oxblood transition-colors">{product.subcategory || product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-ink">{product.title}</span>
        </div>
      </div>

      {/* Product */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="aspect-[3/4] bg-parchment mb-4 overflow-hidden">
              <img
                src={product.images[activeImg] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-oxblood' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brass mb-2">{product.subcategory}</p>
              <h1 className="font-display text-3xl lg:text-4xl mb-2">{product.title}</h1>
              <p className="text-stone text-sm">{product.subtitle}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-medium tabular-nums">Rs. {product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-base text-stone line-through tabular-nums">Rs. {product.compareAtPrice.toLocaleString()}</span>
                  <span className="text-xs text-terracotta font-medium">
                    Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] mb-3">
                Color: <span className="text-stone normal-case tracking-normal">{product.colors[selectedColor]?.name}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(i)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${i === selectedColor ? 'border-oxblood' : 'border-hairline'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.15em]">
                  Size: <span className="text-stone normal-case tracking-normal">{activeSize}</span>
                </p>
                <button className="text-[11px] uppercase tracking-[0.15em] text-stone underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] px-4 py-2.5 text-sm border transition-colors ${
                      activeSize === size ? 'border-oxblood bg-oxblood text-ivory' : 'border-hairline hover:border-ink'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-hairline">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 hover:bg-parchment transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-3 hover:bg-parchment transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] uppercase tracking-[0.18em] font-medium transition-smooth ${
                  addedToBag ? 'bg-sage text-ivory' : 'bg-oxblood text-ivory hover:bg-ink'
                }`}
              >
                {addedToBag ? (
                  <>
                    <Check size={16} /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Bag
                  </>
                )}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-12 h-12 border border-hairline flex items-center justify-center hover:border-oxblood transition-colors"
              >
                <Heart size={18} className={isWished ? 'fill-oxblood text-oxblood' : 'text-ink'} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="border border-hairline p-4 mb-8 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={16} className="text-sage" />
                <span>Free delivery on orders above Rs. 3,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={16} className="text-sage" />
                <span>Easy 7-day returns and exchanges</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Share2 size={16} className="text-stone" />
                <span>Share via WhatsApp</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-hairline">
              {[
                { id: 'details', title: 'Product Details', content: product.description },
                { id: 'fabric', title: 'Fabric & Care', content: `Fabric: ${product.fabric}. Dry clean recommended. Store in a cool, dry place. Iron on reverse side.` },
                { id: 'shipping', title: 'Shipping & Returns', content: 'Standard delivery: 3-5 business days. Free shipping on orders above Rs. 3,000. Easy 7-day returns for unworn items with tags attached.' },
              ].map(acc => (
                <div key={acc.id} className="border-b border-hairline">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium text-left"
                  >
                    {acc.title}
                    <span className={`transform transition-transform ${openAccordion === acc.id ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {openAccordion === acc.id && (
                    <div className="pb-4 text-sm text-stone leading-relaxed">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-hairline">
            <h2 className="font-display text-3xl mb-8">Complete the Look</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky add to cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-hairline p-4 lg:hidden z-40">
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-4 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${
            addedToBag ? 'bg-sage text-ivory' : 'bg-oxblood text-ivory'
          }`}
        >
          {addedToBag ? (
            <>
              <Check size={16} /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Add to Bag — Rs. {(product.price * quantity).toLocaleString()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
