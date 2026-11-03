import { useStore } from '../../data/store';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function AdminDashboard() {
  const { orders, products, customers, getStats } = useStore();
  const stats = getStats();

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock < 15);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">Dashboard</h1>
        <p className="text-sm text-stone">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Today\'s Revenue', value: `Rs. ${stats.todaySales.toLocaleString()}`, icon: DollarSign, change: '+12%', up: true },
          { label: 'Today\'s Orders', value: stats.todayOrders.toString(), icon: ShoppingCart, change: '+3', up: true },
          { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: AlertTriangle, change: 'Needs attention', up: false },
          { label: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, change: '+2 this week', up: true },
        ].map(stat => (
          <div key={stat.label} className="bg-ivory border border-hairline p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={20} className="text-stone" />
              <span className={`text-xs flex items-center gap-0.5 ${stat.up ? 'text-sage' : 'text-terracotta'}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-medium tabular-nums mb-1">{stat.value}</p>
            <p className="text-xs text-stone">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-ivory border border-hairline">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <a href="/admin/orders" className="text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors">View All</a>
          </div>
          <div className="divide-y divide-hairline">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-stone">{order.customer.name} · {order.customer.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">Rs. {order.total.toLocaleString()}</p>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                    order.status === 'pending' ? 'bg-brass/10 text-brass' :
                    order.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                    order.status === 'shipped' ? 'bg-oxblood/10 text-oxblood' :
                    order.status === 'delivered' ? 'bg-sage/10 text-sage' :
                    'bg-stone/10 text-stone'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-ivory border border-hairline">
          <div className="p-6 border-b border-hairline">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} className="text-terracotta" /> Low Stock Alert
            </h2>
          </div>
          <div className="divide-y divide-hairline">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone">All products are well stocked</div>
            ) : (
              lowStockProducts.map(product => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{product.title}</p>
                    <p className="text-xs text-stone">{product.fabric}</p>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${product.stock < 10 ? 'text-terracotta' : 'text-brass'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="mt-6 bg-ivory border border-hairline p-6">
        <h2 className="text-sm font-medium mb-6">Revenue Overview</h2>
        <div className="flex items-end gap-2 h-40">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-oxblood/80 hover:bg-oxblood transition-colors" style={{ height: `${h}%` }} />
              <span className="text-[9px] text-stone">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
