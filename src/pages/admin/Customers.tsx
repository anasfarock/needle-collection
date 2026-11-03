import { useState } from 'react';
import { useStore } from '../../data/store';
import { Search, Phone, Mail, MapPin, ShoppingBag, DollarSign } from 'lucide-react';

export function AdminCustomers() {
  const { customers, orders } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search) && !(c.email || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const customerOrders = selectedCustomer ? orders.filter(o => o.customer.id === selectedCustomer) : [];
  const selectedCust = customers.find(c => c.id === selectedCustomer);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Customers</h1>
          <p className="text-sm text-stone">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-hairline text-sm outline-none focus:border-oxblood transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-ivory border border-hairline">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Customer</th>
                <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">City</th>
                <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Orders</th>
                <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(customer => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`cursor-pointer transition-colors ${selectedCustomer === customer.id ? 'bg-parchment' : 'hover:bg-parchment/30'}`}
                >
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-stone flex items-center gap-1"><Phone size={10} /> {customer.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-stone">{customer.city || '—'}</td>
                  <td className="py-3 px-4 text-sm tabular-nums">{customer.totalOrders}</td>
                  <td className="py-3 px-4 text-sm font-medium tabular-nums">Rs. {customer.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Detail */}
        <div className="bg-ivory border border-hairline">
          {selectedCust ? (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-oxblood/10 flex items-center justify-center text-oxblood font-medium">
                  {selectedCust.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{selectedCust.name}</p>
                  <p className="text-xs text-stone">Customer since {new Date(selectedCust.createdAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-stone">
                  <Phone size={14} /> {selectedCust.phone}
                </div>
                {selectedCust.email && (
                  <div className="flex items-center gap-2 text-sm text-stone">
                    <Mail size={14} /> {selectedCust.email}
                  </div>
                )}
                {selectedCust.city && (
                  <div className="flex items-center gap-2 text-sm text-stone">
                    <MapPin size={14} /> {selectedCust.city}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-parchment p-3">
                  <p className="text-xs text-stone mb-1">Total Orders</p>
                  <p className="text-lg font-medium tabular-nums">{selectedCust.totalOrders}</p>
                </div>
                <div className="bg-parchment p-3">
                  <p className="text-xs text-stone mb-1">Total Spent</p>
                  <p className="text-lg font-medium tabular-nums">Rs. {selectedCust.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-3">Order History</h3>
              <div className="space-y-2">
                {customerOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-hairline">
                    <div>
                      <p className="text-xs font-medium">{order.orderNumber}</p>
                      <p className="text-[10px] text-stone">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs tabular-nums">Rs. {order.total.toLocaleString()}</p>
                      <span className={`text-[9px] uppercase ${order.status === 'delivered' ? 'text-sage' : order.status === 'pending' ? 'text-brass' : 'text-stone'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {customerOrders.length === 0 && (
                  <p className="text-xs text-stone text-center py-4">No orders found</p>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 text-[10px] uppercase tracking-[0.15em] border border-hairline hover:bg-parchment transition-colors flex items-center justify-center gap-1">
                  <Phone size={12} /> Call
                </button>
                <button className="flex-1 py-2 text-[10px] uppercase tracking-[0.15em] border border-hairline hover:bg-parchment transition-colors flex items-center justify-center gap-1">
                  <Mail size={12} /> Email
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-stone">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
