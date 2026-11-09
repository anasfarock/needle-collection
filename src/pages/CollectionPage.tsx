import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../data/store';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, Grid2X2 } from 'lucide-react';

export function CollectionPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products } = useStore();
  const [sortBy, setSortBy] = useState('newest');
  const [gridCols, setGridCols] = useState(4);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const urlSub = searchParams.get('sub');

  useEffect(() => {
    if (urlSub) {
      setSelectedSubcategories([urlSub]);
    } else {
      setSelectedSubcategories([]);
    }
  }, [urlSub, category]);

  const categoryFilteredBase = useMemo(() => {
    let result = [...products].filter(p => p.status === 'active');
    if (category === 'new') result = result.filter(p => p.isNew);
    else if (category === 'sale') result = result.filter(p => p.isSale);
    return result;
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    let result = [...categoryFilteredBase];

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      result = result.filter(p => selectedSubcategories.includes(p.subcategory));
    }
    // Fabric filter
    if (selectedFabrics.length > 0) {
      result = result.filter(p => selectedFabrics.includes(p.fabric));
    }
    // Season filter
    if (selectedSeasons.length > 0) {
      result = result.filter(p => selectedSeasons.includes(p.season));
    }
    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')); break;
    }
    return result;
  }, [categoryFilteredBase, selectedSubcategories, sortBy, selectedFabrics, selectedSeasons, priceRange]);

  const subcategories = [...new Set(categoryFilteredBase.map(p => p.subcategory).filter(Boolean))];
  const fabrics = [...new Set(categoryFilteredBase.map(p => p.fabric).filter(Boolean))];
  const seasons = [...new Set(categoryFilteredBase.map(p => p.season).filter(Boolean))];

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const categoryTitle = urlSub
    ? urlSub
    : category === 'new'
    ? 'New Arrivals'
    : category === 'sale'
    ? 'Sale'
    : 'Menswear Collection';

  return (
    <div className="pt-24 lg:pt-32">
      {/* Banner */}
      <div className="relative h-64 lg:h-80 overflow-hidden mb-12">
        <img
          src="https://image.qwenlm.ai/generated-images/bd78c216-4a27-46e3-8267-b80e509e5a0d/_result.png"
          alt={categoryTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-5xl lg:text-7xl text-ivory">{categoryTitle}</h1>
            <p className="text-ivory/70 mt-2 text-sm">{filteredProducts.length} products</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-hairline">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={() => setGridCols(3)} className={`p-1 ${gridCols === 3 ? 'text-oxblood' : 'text-stone'}`}>
                <Grid3X3 size={18} />
              </button>
              <button onClick={() => setGridCols(4)} className={`p-1 ${gridCols === 4 ? 'text-oxblood' : 'text-stone'}`}>
                <Grid2X2 size={18} />
              </button>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-b border-hairline text-[11px] uppercase tracking-[0.15em] pr-6 py-2 outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar - Desktop */}
          <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-ivory p-6 overflow-auto' : 'hidden'} lg:block lg:static lg:w-56 shrink-0`}>
            {filtersOpen && (
              <button onClick={() => setFiltersOpen(false)} className="lg:hidden mb-4 flex items-center gap-2 text-sm">
                <X size={18} /> Close
              </button>
            )}
            <div className="space-y-8">
              {subcategories.length > 0 && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Style</h3>
                  {subcategories.map(sub => (
                    <label key={sub} className="flex items-center gap-2 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(sub)}
                        onChange={() => toggleFilter(selectedSubcategories, setSelectedSubcategories, sub)}
                        className="w-3.5 h-3.5 accent-oxblood"
                      />
                      <span className="text-sm text-stone">{sub}</span>
                    </label>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Fabric</h3>
                {fabrics.map(f => (
                  <label key={f} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(f)}
                      onChange={() => toggleFilter(selectedFabrics, setSelectedFabrics, f)}
                      className="w-3.5 h-3.5 accent-oxblood"
                    />
                    <span className="text-sm text-stone">{f}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Season</h3>
                {seasons.map(s => (
                  <label key={s} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSeasons.includes(s)}
                      onChange={() => toggleFilter(selectedSeasons, setSelectedSeasons, s)}
                      className="w-3.5 h-3.5 accent-oxblood"
                    />
                    <span className="text-sm text-stone">{s}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full border-b border-hairline py-1 text-sm outline-none"
                    placeholder="Min"
                  />
                  <span className="text-stone">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full border-b border-hairline py-1 text-sm outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubcategories([]);
                  setSelectedFabrics([]);
                  setSelectedSeasons([]);
                  setPriceRange([0, 100000]);
                  setSearchParams({});
                }}
                className="text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-2xl mb-2">No products found</p>
                <p className="text-stone text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 lg:gap-6`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
