import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, Product } from '../../data/store';
import { Plus, Search, Edit2, Trash2, ExternalLink, X, Upload, Image as ImageIcon } from 'lucide-react';

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  Men: ['Kurta', 'Shalwar Kameez', 'Waistcoats', 'Sherwani', 'Unstitched'],
};

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unstitched'];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1614252369475-531eba8c5eb1?w=600&h=800&fit=crop';

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1B2A4A');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Men',
    subcategory: 'Kurta',
    fabric: 'Cotton',
    season: 'All',
    price: '',
    compareAtPrice: '',
    stock: '25',
    status: 'active' as Product['status'],
    isNew: true,
    isSale: false,
    images: [] as string[],
    sizes: ['S', 'M', 'L', 'XL'] as string[],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1B2A4A' }] as { name: string; hex: string }[],
  });

  const filtered = products.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.subcategory.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterCategory !== 'all' && p.subcategory !== filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const openNew = () => {
    setEditingProduct(null);
    setFormError('');
    setNewImageUrl('');
    setForm({
      title: '',
      subtitle: '',
      description: '',
      category: 'Men',
      subcategory: 'Kurta',
      fabric: 'Cotton',
      season: 'All',
      price: '',
      compareAtPrice: '',
      stock: '25',
      status: 'active',
      isNew: true,
      isSale: false,
      images: [],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1B2A4A' }],
    });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormError('');
    setNewImageUrl('');
    setForm({
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory || (SUBCATEGORIES_BY_CATEGORY[p.category]?.[0] ?? 'Kurta'),
      fabric: p.fabric,
      season: p.season,
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice?.toString() || '',
      stock: p.stock.toString(),
      status: p.status,
      isNew: !!p.isNew,
      isSale: !!p.isSale,
      images: [...p.images],
      sizes: p.sizes?.length ? [...p.sizes] : ['Unstitched'],
      colors: p.colors?.length ? [...p.colors] : [{ name: 'Default', hex: '#F6F1E9' }],
    });
    setShowForm(true);
  };

  const handleCategoryChange = (category: string) => {
    const defaultSub = SUBCATEGORIES_BY_CATEGORY[category]?.[0] || 'Kurta';
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    setForm(prev => ({
      ...prev,
      category,
      subcategory: defaultSub,
      sizes: prev.sizes.length ? prev.sizes : defaultSizes,
    }));
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setForm(prev => ({ ...prev, images: [...prev.images, trimmed] }));
    setNewImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleAddColor = () => {
    const trimmed = newColorName.trim();
    if (!trimmed) return;
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { name: trimmed, hex: newColorHex }],
    }));
    setNewColorName('');
  };

  const removeColor = (index: number) => {
    setForm(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFormError('Please enter a valid price.');
      return;
    }

    setSaving(true);
    setFormError('');

    const finalImages = form.images.length > 0
      ? form.images
      : newImageUrl.trim()
      ? [newImageUrl.trim()]
      : [DEFAULT_IMAGE];

    const finalSizes = form.sizes.length > 0 ? form.sizes : ['Unstitched'];
    const finalColors = form.colors.length > 0 ? form.colors : [{ name: 'Default', hex: '#F6F1E9' }];

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          description: form.description.trim(),
          category: form.category,
          subcategory: form.subcategory,
          fabric: form.fabric.trim() || 'Cotton',
          season: form.season,
          status: form.status,
          price: parseInt(form.price, 10) || 0,
          compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice, 10) : undefined,
          stock: parseInt(form.stock, 10) || 0,
          isNew: form.isNew,
          isSale: form.isSale,
          images: finalImages,
          sizes: finalSizes,
          colors: finalColors,
        });
      } else {
        await addProduct({
          slug: form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          description: form.description.trim(),
          category: form.category,
          subcategory: form.subcategory,
          fabric: form.fabric.trim() || 'Cotton',
          season: form.season,
          status: form.status,
          price: parseInt(form.price, 10) || 0,
          compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice, 10) : undefined,
          images: finalImages,
          colors: finalColors,
          sizes: finalSizes,
          stock: parseInt(form.stock, 10) || 0,
          isNew: form.isNew,
          isSale: form.isSale,
          publishedAt: new Date().toISOString().split('T')[0],
        });
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Products</h1>
          <p className="text-sm text-stone">{products.length} total products in catalog</p>
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
            placeholder="Search products by title or subcategory..."
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
          <option value="all">All Styles</option>
          <option value="Kurta">Kurta</option>
          <option value="Shalwar Kameez">Shalwar Kameez</option>
          <option value="Waistcoats">Waistcoats</option>
          <option value="Sherwani">Sherwani</option>
          <option value="Unstitched">Unstitched</option>
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
                      <p className="text-xs text-stone">
                        {product.subcategory ? `${product.subcategory} · ` : ''}{product.fabric} · {product.season}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-stone">
                  <div>{product.category}</div>
                  <div className="flex gap-1 mt-0.5">
                    {product.isNew && <span className="text-[9px] uppercase tracking-wider bg-ink text-ivory px-1.5 py-0.5">New</span>}
                    {product.isSale && <span className="text-[9px] uppercase tracking-wider bg-terracotta text-ivory px-1.5 py-0.5">Sale</span>}
                  </div>
                </td>
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
                    <Link
                      to={`/product/${product.slug}`}
                      className="p-1.5 hover:bg-parchment transition-colors"
                      title="View on Storefront"
                    >
                      <ExternalLink size={14} className="text-stone hover:text-ink" />
                    </Link>
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
          <div className="bg-ivory w-full max-w-3xl max-h-[92vh] overflow-auto">
            <div className="p-6 border-b border-hairline flex items-center justify-between sticky top-0 bg-ivory z-10">
              <h2 className="text-lg font-medium">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-parchment transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {formError && (
                <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta px-4 py-2.5 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Royal Embroidered Kurta"
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Festive Collection — Pure Cotton"
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Describe craftsmanship, fit, collar, and fabric details..."
                  className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent"
                  >
                    <option value="Men">Men</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Subcategory</label>
                  <select
                    value={form.subcategory}
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent"
                  >
                    {(SUBCATEGORIES_BY_CATEGORY[form.category] || ['Kurta', 'Unstitched']).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Fabric</label>
                  <input
                    value={form.fabric}
                    onChange={e => setForm({ ...form, fabric: e.target.value })}
                    placeholder="Cotton, Lawn, Wash & Wear..."
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Season</label>
                  <select
                    value={form.season}
                    onChange={e => setForm({ ...form, season: e.target.value })}
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent"
                  >
                    <option value="All">All Seasons</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Price (PKR) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="4500"
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Compare at Price (PKR)</label>
                  <input
                    type="number"
                    value={form.compareAtPrice}
                    onChange={e => setForm({ ...form, compareAtPrice: e.target.value })}
                    placeholder="Optional original price"
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Stock Quantity *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div className="border-t border-hairline pt-5">
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2 block flex items-center gap-1.5">
                  <ImageIcon size={13} /> Product Images
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 min-w-[220px] border border-hairline px-3 py-2 text-sm outline-none focus:border-oxblood"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 text-xs uppercase tracking-wider bg-parchment border border-hairline hover:border-oxblood transition-colors"
                  >
                    Add URL
                  </button>
                  <label className="px-4 py-2 text-xs uppercase tracking-wider bg-parchment border border-hairline hover:border-oxblood transition-colors cursor-pointer flex items-center gap-1.5">
                    <Upload size={13} /> Upload File
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {form.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-24 bg-parchment border border-hairline group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-ink text-ivory rounded-full flex items-center justify-center text-xs"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone">Add an image URL or upload an image file above (a default catalog image will be used if left empty).</p>
                )}
              </div>

              {/* Sizes */}
              <div className="border-t border-hairline pt-5">
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2 block">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map(size => {
                    const active = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 text-xs border transition-colors ${
                          active ? 'bg-oxblood text-ivory border-oxblood' : 'border-hairline text-stone hover:border-ink'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="border-t border-hairline pt-5">
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2 block">Colors</label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={e => setNewColorHex(e.target.value)}
                    className="w-9 h-9 border border-hairline cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    placeholder="Color name (e.g. Emerald)"
                    className="border border-hairline px-3 py-2 text-sm outline-none focus:border-oxblood"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-4 py-2 text-xs uppercase tracking-wider bg-parchment border border-hairline hover:border-oxblood transition-colors"
                  >
                    Add Color
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.colors.map((c, idx) => (
                    <div key={`${c.name}-${idx}`} className="flex items-center gap-2 px-3 py-1.5 border border-hairline bg-parchment/50 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full border border-hairline" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      <button type="button" onClick={() => removeColor(idx)} className="text-stone hover:text-terracotta ml-1">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Visibility Flags */}
              <div className="border-t border-hairline pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Catalog Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as Product['status'] })}
                    className="w-full border border-hairline px-3 py-2.5 text-sm outline-none bg-transparent"
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={e => setForm({ ...form, isNew: e.target.checked })}
                    className="accent-oxblood w-4 h-4"
                  />
                  <span className="text-sm">Feature in New Arrivals</span>
                </label>
                <label className="flex items-center gap-2 pt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSale}
                    onChange={e => setForm({ ...form, isSale: e.target.checked })}
                    className="accent-oxblood w-4 h-4"
                  />
                  <span className="text-sm">Feature in Sale</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-hairline flex justify-end gap-3 sticky bottom-0 bg-ivory">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm border border-hairline hover:bg-parchment transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm bg-oxblood text-ivory hover:bg-ink transition-smooth disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
