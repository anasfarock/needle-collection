import { useState } from 'react';
import { useStore, Order } from '../../data/store';
import { Search, Filter, Eye, X, Phone, MessageCircle, Printer, ChevronDown } from 'lucide-react';

export function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(o => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-brass/10 text-brass',
    confirmed: 'bg-sage/10 text-sage',
    packed: 'bg-oxblood/10 text-oxblood',
    shipped: 'bg-blue-50 text-blue-700',
    delivered: 'bg-sage/10 text-sage',
    cancelled: 'bg-terracotta/10 text-terracotta',
  };

  const nextStatus: Record<string, Order['status']> = {
    pending: 'confirmed',
    confirmed: 'packed',
    packed: 'shipped',
    shipped: 'delivered',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Orders</h1>
          <p className="text-sm text-stone">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-10 pr-4 py-2.5 border border-hairline text-sm outline-none focus:border-oxblood transition-colors"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-hairline px-4 py-2.5 text-sm outline-none bg-transparent">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="border border-hairline px-4 py-2.5 text-sm outline-none bg-transparent">
          <option value="all">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-ivory border border-hairline overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Order</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Customer</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Date</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Payment</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Total</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Status</th>
              <th className="text-right text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-parchment/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-stone">{order.items.length} items</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm">{order.customer.name}</p>
                  <p className="text-xs text-stone">{order.customer.city}</p>
                </td>
                <td className="py-3 px-4 text-sm text-stone">
                  {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  <span className={`text-[10px] uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'text-sage' : 'text-brass'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium tabular-nums">Rs. {order.total.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-parchment transition-colors" title="View">
                      <Eye size={14} className="text-stone" />
                    </button>
                    {nextStatus[order.status] && (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatus[order.status])}
                        className="p-1.5 hover:bg-sage/10 transition-colors text-[10px] uppercase tracking-wider text-sage font-medium px-2"
                        title={`Mark as ${nextStatus[order.status]}`}
                      >
                        → {nextStatus[order.status]}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-hairline flex items-center justify-between sticky top-0 bg-ivory z-10">
              <div>
                <h2 className="text-lg font-medium">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-stone">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-parchment transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2">Customer</h3>
                <p className="text-sm font-medium">{selectedOrder.customer.name}</p>
                <p className="text-sm text-stone flex items-center gap-1"><Phone size={12} /> {selectedOrder.customer.phone}</p>
                {selectedOrder.customer.email && <p className="text-sm text-stone">{selectedOrder.customer.email}</p>}
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.shippingAddress.address}</p>
                <p className="text-sm text-stone">{selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-hairline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-parchment overflow-hidden">
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm">{item.product.title}</p>
                          <p className="text-xs text-stone">{item.color} · {item.size} · Qty {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm tabular-nums">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-parchment p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="tabular-nums">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Discount</span>
                    <span className="text-terracotta tabular-nums">-Rs. {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Shipping</span>
                  <span className="tabular-nums">{selectedOrder.shipping === 0 ? 'Free' : `Rs. ${selectedOrder.shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-hairline">
                  <span>Total</span>
                  <span className="tabular-nums">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'packed', 'shipped', 'delivered'].map((s, i) => {
                    const statusOrder = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
                    const currentIdx = statusOrder.indexOf(selectedOrder.status);
                    const isComplete = i <= currentIdx;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-sage' : 'bg-hairline'}`} />
                        <span className={`text-sm capitalize ${isComplete ? 'text-ink' : 'text-stone'}`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-hairline flex flex-wrap gap-3">
              {nextStatus[selectedOrder.status] && (
                <button
                  onClick={() => { updateOrderStatus(selectedOrder.id, nextStatus[selectedOrder.status]); setSelectedOrder(null); }}
                  className="px-5 py-2.5 text-sm bg-oxblood text-ivory hover:bg-ink transition-smooth"
                >
                  Mark as {nextStatus[selectedOrder.status]}
                </button>
              )}
              <button className="px-5 py-2.5 text-sm border border-hairline hover:bg-parchment transition-colors flex items-center gap-2">
                <MessageCircle size={14} /> WhatsApp Customer
              </button>
              <button className="px-5 py-2.5 text-sm border border-hairline hover:bg-parchment transition-colors flex items-center gap-2">
                <Printer size={14} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
