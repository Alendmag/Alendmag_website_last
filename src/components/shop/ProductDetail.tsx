import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { products as productsApi } from '../../lib/api';
import type { Product } from '../../lib/supabase';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.get(id);
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            {isRTL ? 'المنتج غير موجود' : 'Product not found'}
          </h2>
          <Link to="/shop" className="text-blue-600 hover:underline">
            {isRTL ? 'العودة إلى المتجر' : 'Back to Store'}
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en,
      price: product.price,
      image: product.image_url || ''
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-blue-600">{isRTL ? 'الرئيسية' : 'Home'}</Link>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/shop" className="hover:text-blue-600">{isRTL ? 'المتجر' : 'Shop'}</Link>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-blue-600">{isRTL ? product.name_ar : product.name_en}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 shadow-2xl">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={isRTL ? product.name_ar : product.name_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-blue-300 dark:text-gray-600" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {isRTL ? product.name_ar : product.name_en}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {isRTL ? product.description_ar : product.description_en}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
              <span className="text-4xl font-bold text-blue-600">
                {product.price.toLocaleString()} {isRTL ? 'د.ل' : 'LYD'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
              </h3>
              <div className="space-y-3">
                {[
                  isRTL ? 'دعم فني متخصص 24/7' : '24/7 Specialized Technical Support',
                  isRTL ? 'تحديثات مجانية مدى الحياة' : 'Free Lifetime Updates',
                  isRTL ? 'واجهة عربية وإنجليزية' : 'Arabic & English Interface',
                  isRTL ? 'تقارير تفصيلية وإحصاءات' : 'Detailed Reports & Statistics',
                  isRTL ? 'تدريب على استخدام النظام' : 'System Usage Training'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isRTL ? 'أضف للسلة' : 'Add to Cart'}
              </button>
              <Link
                to="/shop"
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {isRTL ? 'العودة' : 'Back'}
              </Link>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>{isRTL ? 'التوصيل' : 'Delivery'}</span>
                <span className="font-medium text-green-600">{isRTL ? 'مجاني' : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isRTL ? 'الضمان' : 'Warranty'}</span>
                <span className="font-medium">{isRTL ? 'سنة واحدة' : '1 Year'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isRTL ? 'الدعم الفني' : 'Technical Support'}</span>
                <span className="font-medium">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
