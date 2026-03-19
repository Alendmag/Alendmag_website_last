import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ListFilter as Filter, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import { products as productsApi } from '../../lib/api';
import type { Product } from '../../lib/supabase';

const ShopPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.list({ active: true });
        setProducts(data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const name = isRTL ? product.name_ar : product.name_en;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (priceSort === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [searchTerm, selectedCategory, priceSort, isRTL, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? 'متجر الحلول البرمجية' : 'Software Solutions Store'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {isRTL ? 'اكتشف أفضل الحلول البرمجية لأعمالك' : 'Discover the best software solutions for your business'}
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            {isRTL ? (showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر') : (showFilters ? 'Hide Filters' : 'Show Filters')}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {isRTL ? 'الفلاتر' : 'Filters'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceSort('none');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isRTL ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {isRTL ? 'الفئة' : 'Category'}
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === 'all'}
                        onChange={() => setSelectedCategory('all')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الكل' : 'All'}</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-600 dark:text-gray-400">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {isRTL ? 'ترتيب السعر' : 'Price Sort'}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { value: 'none', ar: 'بدون ترتيب', en: 'Default' },
                      { value: 'low-to-high', ar: 'من الأقل إلى الأعلى', en: 'Low to High' },
                      { value: 'high-to-low', ar: 'من الأعلى إلى الأقل', en: 'High to Low' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priceSort"
                          checked={priceSort === opt.value}
                          onChange={() => setPriceSort(opt.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-600 dark:text-gray-400">{isRTL ? opt.ar : opt.en}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredProducts.length} {isRTL ? 'منتج' : 'products'}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {isRTL ? 'لا توجد منتجات متاحة حالياً' : 'No products available at the moment'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="relative h-48 overflow-hidden block bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={isRTL ? product.name_ar : product.name_en}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-16 h-16 text-blue-300 dark:text-gray-600" />
                        </div>
                      )}
                    </Link>

                    <div className="p-6 space-y-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {product.category}
                      </div>

                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
                          {isRTL ? product.name_ar : product.name_en}
                        </h3>
                      </Link>

                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {isRTL ? product.description_ar : product.description_en}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-600">
                          {product.price.toLocaleString()} {isRTL ? 'د.ل' : 'LYD'}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => addToCart({
                            id: product.id,
                            name: product.name_ar,
                            nameEn: product.name_en,
                            price: product.price,
                            image: product.image_url || ''
                          })}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          {isRTL ? 'عرض' : 'View'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
