import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, useStore } from '../data/store';
import { Heart } from 'lucide-react';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [hovered, setHovered] = useState(false);
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWished = wishlist.includes(product.id);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const currentImage = hovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-parchment mb-4">
        <img
          src={currentImage}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-500"
        />
        
        {/* Labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="text-[9px] uppercase tracking-[0.15em] font-medium bg-ivory/90 px-2 py-1">New</span>
          )}
          {product.isSale && discount > 0 && (
            <span className="text-[9px] uppercase tracking-[0.15em] font-medium bg-terracotta/90 text-ivory px-2 py-1">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 bg-ivory/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={16} className={isWished ? 'fill-oxblood text-oxblood' : 'text-ink'} />
        </button>

        {/* Quick Add */}
        <div className={`absolute bottom-0 left-0 right-0 bg-ivory/95 backdrop-blur-sm p-3 transform transition-transform duration-300 ${hovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center gap-2">
            {product.sizes.slice(0, 4).map(size => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product, size, product.colors[0]?.name || '');
                }}
                className="flex-1 text-[10px] uppercase tracking-wider border border-hairline py-2 hover:bg-oxblood hover:text-ivory hover:border-oxblood transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </Link>

      {/* Info */}
      <Link to={`/product/${product.slug}`}>
        <h3 className="font-display text-lg leading-tight mb-1 group-hover:text-oxblood transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-stone mb-2">{product.subtitle}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone line-through tabular-nums">
              Rs. {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        {/* Color dots */}
        <div className="flex gap-1.5 mt-2">
          {product.colors.map(color => (
            <span
              key={color.name}
              className="w-3 h-3 rounded-full border border-hairline"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}
