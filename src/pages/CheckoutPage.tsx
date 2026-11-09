import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useStore, Order } from '../data/store';
import { Check, Lock, Truck, Phone, CreditCard } from 'lucide-react';

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

export function CheckoutPage() {
  const { cart, clearCart, addOrder } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    phone: '', email: '', name: '', address: '', city: '', area: '', landmark: '',
    paymentMethod: 'cod' as 'cod' | 'jazzcash' | 'easypaisa' | 'card' | 'bank_transfer',
    notes: '',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const codFee = form.paymentMethod === 'cod' ? 0 : 0;
  const total = subtotal + shipping + codFee;

  const handlePlaceOrder = async () => {
    const orderNum = `NC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const order: Order = {
      id: `o${Date.now()}`,
      orderNumber: orderNum,
      customer: {
        id: `c${Date.now()}`,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        city: form.city,
        totalOrders: 1,
        totalSpent: total,
        createdAt: new Date().toISOString(),
      },
      items: cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
      })),
      subtotal,
      discount: 0,
      shipping,
      total,
      status: 'pending',
      paymentStatus: form.paymentMethod === 'cod' ? 'unpaid' : 'paid',
      paymentMethod: form.paymentMethod,
      shippingAddress: {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address,
        city: form.city,
        area: form.area,
        landmark: form.landmark || undefined,
      },
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const savedOrder = await addOrder(order);
    setOrderNumber(savedOrder.orderNumber || orderNum);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="pt-32 min-h-screen">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-sage" />
          </div>
          <h1 className="font-display text-4xl mb-3">Order Confirmed</h1>
          <p className="text-stone mb-2">Thank you for your order!</p>
          <p className="text-lg font-medium mb-8">Order #{orderNumber}</p>
          
          <div className="bg-parchment border border-hairline p-6 mb-8 text-left">
            <p className="text-sm text-stone mb-2">Estimated delivery: 3-5 business days</p>
            <p className="text-sm text-stone">We'll send a WhatsApp confirmation to your phone number shortly.</p>
          </div>

          {form.paymentMethod === 'cod' && (
            <div className="bg-parchment border border-hairline p-6 mb-8 text-left">
              <p className="text-sm font-medium mb-2">Cash on Delivery</p>
              <p className="text-sm text-stone">Please keep Rs. {total.toLocaleString()} ready at the time of delivery. Our courier partner will call you to confirm before dispatch.</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link to="/" className="inline-flex items-center gap-2 bg-oxblood text-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <h1 className="font-display text-4xl mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-12">
          {['Contact', 'Delivery', 'Payment'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-medium ${step > i + 1 ? 'bg-sage text-ivory' : step === i + 1 ? 'bg-oxblood text-ivory' : 'bg-parchment text-stone'}`}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs uppercase tracking-[0.15em] ${step === i + 1 ? 'text-ink font-medium' : 'text-stone'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-hairline mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            {/* Contact */}
            <div className="mb-10">
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4 flex items-center gap-2">
                <Phone size={14} /> Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone mb-1 block">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone mb-1 block">Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="mb-10">
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4 flex items-center gap-2">
                <Truck size={14} /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone mb-1 block">Address *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone mb-1 block">City *</label>
                    <select
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors bg-transparent"
                    >
                      <option value="">Select city</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone mb-1 block">Area</label>
                    <input
                      type="text"
                      value={form.area}
                      onChange={e => setForm({ ...form, area: e.target.value })}
                      className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-stone mb-1 block">Landmark (optional)</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={e => setForm({ ...form, landmark: e.target.value })}
                    className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="mb-10">
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Payment Method
              </h2>
              <div className="space-y-2">
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                  { value: 'jazzcash', label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet' },
                  { value: 'easypaisa', label: 'Easypaisa', desc: 'Pay via Easypaisa mobile wallet' },
                  { value: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard' },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                ].map(method => (
                  <label key={method.value} className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${form.paymentMethod === method.value ? 'border-oxblood bg-oxblood/5' : 'border-hairline hover:border-stone'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}
                      className="accent-oxblood"
                    />
                    <div>
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-stone">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-stone mb-1 block">Order Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border-b border-hairline py-3 text-sm outline-none focus:border-oxblood transition-colors resize-none"
                placeholder="Any special instructions..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-parchment border border-hairline p-6 lg:p-8 sticky top-32">
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className="w-14 h-18 bg-ivory shrink-0 overflow-hidden">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.product.title}</p>
                      <p className="text-xs text-stone">{item.color} · {item.size} · Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm tabular-nums">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-hairline pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="tabular-nums">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Shipping</span>
                  <span className="tabular-nums">{shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-hairline pt-2 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium text-lg tabular-nums">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!form.phone || !form.name || !form.address || !form.city}
                className="w-full mt-6 bg-oxblood text-ivory py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-ink transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={14} /> Place Order
              </button>

              <p className="text-[10px] text-stone text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>

              {form.paymentMethod === 'cod' && (
                <div className="mt-4 p-3 bg-ivory border border-hairline">
                  <p className="text-xs text-stone flex items-center gap-2">
                    <Phone size={12} /> COD orders will be confirmed via WhatsApp before dispatch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
