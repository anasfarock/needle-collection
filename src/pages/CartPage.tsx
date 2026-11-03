import { Link } from 'react-router-dom';
import { useStore } from '../data/store';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export function CartPage() {
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min(100, (subtotal / 3000) * 100);

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-stone/30 mb-6" />
          <h1 className="font-display text-3xl mb-3">Your Bag is Empty</h1>
          <p className="text-stone text-sm mb-8">Discover our latest collections and find something you love.</p>
          <Link to="/collections/women" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <h1 className="font-display text-4xl lg:text-5xl mb-2">Shopping Bag</h1>
        <p className="text-stone text-sm mb-12">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>

        {/* Free shipping progress */}
        {subtotal < 3000 && (
          <div className="mb-8 p-4 bg-parchment border border-hairline">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={16} className="text-sage" />
              <span className="text-sm">
                Add Rs. {(3000 - subtotal).toLocaleString()} more for free delivery
              </span>
            </div>
            <div className="h-1 bg-hairline rounded-full overflow-hidden">
              <div className="h-full bg-sage transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-hairline">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-6 py-6">
                  <Link to={`/product/${item.product.slug}`} className="w-24 h-32 lg:w-32 lg:h-40 bg-parchment shrink-0 overflow-hidden">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link to={`/product/${item.product.slug}`} className="font-display text-lg hover:text-oxblood transition-colors">
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-stone mt-1">{item.color} · {item.size}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-stone hover:text-terracotta transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-hairline">
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="px-3 py-2 hover:bg-parchment transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="px-3 py-2 hover:bg-parchment transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/collections/women" className="inline-flex items-center gap-2 mt-8 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-parchment border border-hairline p-6 lg:p-8 sticky top-32">
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-6">Order Summary</h2>
              
              {/* Promo code */}
              <div className="mb-6">
                <div className="flex border-b border-ink">
                  <input type="text" placeholder="Promo code" className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-stone/50" />
                  <button className="text-[11px] uppercase tracking-[0.15em] font-medium">Apply</button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="tabular-nums">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Shipping</span>
                  <span className="tabular-nums">{shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-hairline pt-3 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium text-lg tabular-nums">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full text-center bg-oxblood text-ivory py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 pt-4 border-t border-hairline">
                <p className="text-[10px] text-stone text-center">
                  Cash on Delivery · JazzCash · Easypaisa · Card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
