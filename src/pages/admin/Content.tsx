import { useState, useEffect } from 'react';
import { useStore, ContentBlock, BannerItem } from '../../data/store';
import { Save, Eye, Plus, GripVertical, Image, Type, Layout, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function AdminContent() {
  const { siteContent, updateSiteContent } = useStore();
  const [blocks, setBlocks] = useState<ContentBlock[]>(siteContent.blocks);
  const [banners, setBanners] = useState<BannerItem[]>(siteContent.banners);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'homepage' | 'pages' | 'menus' | 'banners'>('homepage');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBannerText, setNewBannerText] = useState('');

  useEffect(() => {
    setBlocks(siteContent.blocks);
    setBanners(siteContent.banners);
  }, [siteContent]);

  const toggleVisibility = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  const updateBlockContent = (id: string, key: string, value: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: { ...b.content, [key]: value } } : b));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === prev.length - 1)) return prev;
      const newBlocks = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
      return newBlocks;
    });
  };

  const toggleBanner = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const addBanner = () => {
    if (!newBannerText.trim()) return;
    setBanners(prev => [...prev, { id: `b${Date.now()}`, text: newBannerText.trim(), active: true }]);
    setNewBannerText('');
  };

  const removeBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSiteContent({ blocks, banners });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const blockTypeIcons: Record<string, any> = {
    hero: Image,
    collection_grid: Layout,
    product_carousel: Layout,
    editorial: Type,
    usp_strip: Layout,
    newsletter: Type,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Content Manager</h1>
          <p className="text-sm text-stone">Manage homepage sections, announcements, and navigation</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.15em] font-medium transition-smooth ${saved ? 'bg-sage text-ivory' : 'bg-oxblood text-ivory hover:bg-ink'}`}
        >
          <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-hairline">
        {(['homepage', 'banners', 'pages', 'menus'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-oxblood text-oxblood' : 'border-transparent text-stone hover:text-ink'}`}
          >
            {tab === 'homepage' ? 'Homepage Builder' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'homepage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Block List */}
          <div className="lg:col-span-1">
            <div className="bg-ivory border border-hairline">
              <div className="p-4 border-b border-hairline flex items-center justify-between">
                <h2 className="text-sm font-medium">Homepage Sections</h2>
              </div>
              <div className="divide-y divide-hairline">
                {blocks.map((block, i) => {
                  const Icon = blockTypeIcons[block.type] || Layout;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setEditingBlock(block.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${editingBlock === block.id ? 'bg-parchment' : 'hover:bg-parchment/50'}`}
                    >
                      <GripVertical size={14} className="text-stone/40 shrink-0" />
                      <Icon size={16} className="text-stone shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{block.title}</p>
                        <p className="text-[10px] text-stone capitalize">{block.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-1 hover:bg-ivory transition-colors" disabled={i === 0}>
                          <ChevronUp size={12} className={i === 0 ? 'text-stone/20' : 'text-stone'} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-1 hover:bg-ivory transition-colors" disabled={i === blocks.length - 1}>
                          <ChevronDown size={12} className={i === blocks.length - 1 ? 'text-stone/20' : 'text-stone'} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleVisibility(block.id); }} className="p-1 hover:bg-ivory transition-colors" title="Toggle Visibility">
                          <Eye size={12} className={block.visible ? 'text-ink' : 'text-stone/30'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Block Editor */}
          <div className="lg:col-span-2">
            {editingBlock ? (
              <div className="bg-ivory border border-hairline">
                {(() => {
                  const block = blocks.find(b => b.id === editingBlock);
                  if (!block) return null;
                  return (
                    <div className="p-6">
                      <h2 className="text-lg font-medium mb-1">{block.title}</h2>
                      <p className="text-xs text-stone mb-6 capitalize">{block.type.replace('_', ' ')} Section</p>
                      
                      <div className="space-y-4">
                        {Object.entries(block.content).map(([key, value]) => (
                          <div key={key}>
                            <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            {key === 'body' ? (
                              <textarea
                                value={value}
                                onChange={e => updateBlockContent(block.id, key, e.target.value)}
                                rows={4}
                                className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood resize-none"
                              />
                            ) : (
                              <input
                                value={value}
                                onChange={e => updateBlockContent(block.id, key, e.target.value)}
                                className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-parchment border border-hairline">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-stone mb-2">Live Preview</p>
                        <div className="bg-ivory p-4 border border-hairline">
                          {block.content.headline && <p className="font-display text-2xl mb-2">{block.content.headline}</p>}
                          {block.content.subtitle && <p className="text-xs text-stone uppercase tracking-[0.15em] mb-2">{block.content.subtitle}</p>}
                          {block.content.body && <p className="text-sm text-stone">{block.content.body}</p>}
                          {block.content.cta && <p className="text-xs text-oxblood mt-2 uppercase tracking-[0.15em]">{block.content.cta} →</p>}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-ivory border border-hairline p-12 text-center">
                <Layout size={32} className="mx-auto text-stone/30 mb-4" />
                <p className="text-sm text-stone">Select a section to edit</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="bg-ivory border border-hairline">
          <div className="p-4 border-b border-hairline flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Top Announcement Bar Messages</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBannerText}
                onChange={e => setNewBannerText(e.target.value)}
                placeholder="Add new announcement text..."
                className="border border-hairline px-3 py-1.5 text-sm outline-none focus:border-oxblood"
              />
              <button
                onClick={addBanner}
                className="flex items-center gap-1 bg-oxblood text-ivory px-3 py-1.5 text-[11px] uppercase tracking-[0.15em]"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          <div className="divide-y divide-hairline">
            {banners.map(banner => (
              <div key={banner.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${banner.active ? 'bg-sage' : 'bg-stone/30'}`} />
                  <p className="text-sm">{banner.text}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBanner(banner.id)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${banner.active ? 'border-sage/30 text-sage bg-sage/10' : 'border-hairline text-stone'}`}
                  >
                    {banner.active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => removeBanner(banner.id)} className="text-stone hover:text-terracotta p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="bg-ivory border border-hairline">
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <h2 className="text-sm font-medium">Static Pages</h2>
          </div>
          <div className="divide-y divide-hairline">
            {['Our Story', 'Size Guide', 'Shipping & Returns', 'FAQs', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(page => (
              <div key={page} className="p-4 flex items-center justify-between hover:bg-parchment/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{page}</p>
                  <p className="text-xs text-stone">/pages/{page.toLowerCase().replace(/[^a-z]+/g, '-')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-sage bg-sage/10 px-2 py-0.5">Published</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'menus' && (
        <div className="bg-ivory border border-hairline">
          <div className="p-4 border-b border-hairline">
            <h2 className="text-sm font-medium">Navigation Menus</h2>
          </div>
          <div className="p-6 space-y-6">
            {['Main Navigation', 'Footer Links', 'Mobile Menu'].map(menu => (
              <div key={menu}>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-stone mb-3">{menu}</h3>
                <div className="space-y-2">
                  {['Home', 'Kurtas', 'Shalwar Kameez', 'Waistcoats', 'Sherwani', 'New Arrivals', 'Sale'].slice(0, menu === 'Main Navigation' ? 7 : 4).map(item => (
                    <div key={item} className="flex items-center gap-3 p-2 border border-hairline">
                      <GripVertical size={14} className="text-stone/40" />
                      <input defaultValue={item} className="flex-1 bg-transparent text-sm outline-none" />
                      <span className="text-xs text-stone">/{item.toLowerCase().replace(/\s+/g, '-')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
