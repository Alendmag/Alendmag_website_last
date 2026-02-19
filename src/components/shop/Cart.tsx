import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const isRTL = i18n.language === 'ar';

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              السلة فارغة
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              لم تقم بإضافة أي منتجات إلى السلة بعد
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('shop.cart')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            لديك {cart.length} منتج في السلة
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex gap-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-xl"
                />

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {item.name}
                      </h3>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {(item.sale_price || item.price) * item.quantity} د.ل
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 dark:text-gray-400">الكمية:</span>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.sale_price || item.price} د.ل / قطعة
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
            >
              مسح السلة
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-32 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                ملخص الطلب
              </h2>

              <div className="space-y-3 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>المجموع الفرعي</span>
                  <span>{getCartTotal()} د.ل</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>الضرائب</span>
                  <span>0 د.ل</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>التوصيل</span>
                  <span className="text-green-600">مجاني</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
                <span>المجموع الكلي</span>
                <span className="text-blue-600">{getCartTotal()} د.ل</span>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition text-center flex items-center justify-center gap-2"
              >
                متابعة الدفع
                <ArrowRight className={`w-5 h-5 transform ${isRTL ? 'rotate-180' : ''}`} />
              </Link>

              <Link
                to="/shop"
                className="block w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition text-center"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
