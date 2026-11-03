import { useState } from 'react';
import { useStore, Product } from '../../data/store';
import { Plus, Search, Edit2, Trash2, Eye, X, Filter } from 'lucide-react';

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', category: 'Women', subcategory: 'Unstitched',
    fabric: 'Lawn', season: 'Summer', price: '', compareAtPrice: '', stock: '',
    status: 'active' as Product['status'], isNew: false, isSale: false,
  });

  const filtered = products.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  const openNew = () => {
    setEditingProduct(null);
    setForm({ title: '', subtitle: '', description: '', category: 'Women', subcategory: 'Unstitched', fabric: 'Lawn', season: 'Summer', price: '', compareAtPrice: '', stock: '', status: 'active', isNew: false, isSale: false });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      title: p.title, subtitle: p.subtitle, description: p.description,
      category: p.category, subcategory: p.subcategory, fabric: p.fabric, season: p.season,
      price: p.price.toString(), compareAtPrice: p.compareAtPrice?.toString() || '',
      stock: p.stock.toString(), status: p.status, isNew: !!p.isNew, isSale: !!p.isSale,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...form,
        price: parseInt(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice) : undefined,
        stock: parseInt(form.stock) || 0,
      });
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        fabric: form.fabric,
        season: form.season,
        status: form.status,
        price: parseInt(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice) : undefined,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop'],
        colors: [{ name: 'Default', hex: '#F6F1E9' }],
        sizes: ['Unstitched'],
        stock: parseInt(form.stock) || 0,
        isNew: form.isNew,
        isSale: form.isSale,
        publishedAt: new Date().toISOString(),
      };
      addProduct(newProduct);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Products</h1>
          <p className="text-sm text-stone">{products.length} total products</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-oxblood text-ivory px-5 py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-ink transition-smooth">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-hairline text-sm outline-none focus:border-oxblood transition-colors"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-hairline px-4 py-2.5 text-sm outline-none bg-transparent">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-hairline px-4 py-2.5 text-sm outline-none bg-transparent">
          <option value="all">All Categories</option>
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kids">Kids</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-ivory border border-hairline overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Product</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Category</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Price</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Stock</th>
              <th className="text-left text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Status</th>
              <th className="text-right text-[10px] uppercase tracking-[0.15em] text-stone font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-parchment/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-parchment overflow-hidden shrink-0">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-stone">{product.fabric} · {product.season}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-stone">{product.category}</td>
                <td className="py-3 px-4">
                  <p className="text-sm tabular-nums">Rs. {product.price.toLocaleString()}</p>
                  {product.compareAtPrice && (
                    <p className="text-xs text-stone line-through tabular-nums">Rs. {product.compareAtPrice.toLocaleString()}</p>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-sm tabular-nums ${product.stock < 15 ? 'text-terracotta font-medium' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                    product.status === 'active' ? 'bg-sage/10 text-sage' :
                    product.status === 'draft' ? 'bg-brass/10 text-brass' :
                    'bg-stone/10 text-stone'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-parchment transition-colors" title="Edit">
                      <Edit2 size={14} className="text-stone" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="p-1.5 hover:bg-terracotta/10 transition-colors" title="Delete">
                      <Trash2 size={14} className="text-stone hover:text-terracotta" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-hairline flex items-center justify-between sticky top-0 bg-ivory z-10">
              <h2 className="text-lg font-medium">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-parchment transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Title *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Subtitle</label>
                  <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent">
                    <option>Women</option><option>Men</option><option>Kids</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Fabric</label>
                  <input value={form.fabric} onChange={e => setForm({...form, fabric: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Season</label>
                  <select value={form.season} onChange={e => setForm({...form, season: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent">
                    <option>Summer</option><option>Winter</option><option>All</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Price (PKR) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Compare at Price</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent">
                    <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm({...form, isNew: e.target.checked})} className="accent-oxblood" />
                  <span className="text-sm">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.isSale} onChange={e => setForm({...form, isSale: e.target.checked})} className="accent-oxblood" />
                  <span className="text-sm">On Sale</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-hairline flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm border border-hairline hover:bg-parchment transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm bg-oxblood text-ivory hover:bg-ink transition-smooth">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
