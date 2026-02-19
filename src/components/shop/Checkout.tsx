import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { orders as ordersApi, siteSettings } from '../../lib/api';
import toast from 'react-hot-toast';
import { ShoppingBag, User, Mail, Phone, FileText } from 'lucide-react';

const Checkout: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('218920910096');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    const fetchWhatsapp = async () => {
      try {
        const data = await siteSettings.get('company', 'whatsapp_number');
        if (data?.setting_value) setWhatsappNumber(data.setting_value);
      } catch (error) {
        console.error('Error fetching whatsapp number:', error);
      }
    };
    fetchWhatsapp();
  }, []);

  const normalizeLibyanPhone = (phone: string): string => {
    let normalized = phone.replace(/[\s-]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '218' + normalized.substring(1);
    } else if (!normalized.startsWith('218')) {
      normalized = '218' + normalized;
    }
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizeLibyanPhone(formData.phone);

      const orderPromises = cart.map(item =>
        ordersApi.create({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: normalizedPhone,
          product_id: item.id,
          quantity: item.quantity,
          total_amount: item.price * item.quantity,
          status: 'pending',
          notes: formData.notes
        })
      );

      await Promise.all(orderPromises);

      const productsList = cart.map(item => {
        const name = isRTL ? item.name_ar : item.name_en;
        const total = item.price * item.quantity;
        return `- ${name} (x${item.quantity}) - ${total} د.ل`;
      }).join('\n');

      const whatsappMessage = `🛒 *طلب جديد من الموقع*\n\n*العميل:* ${formData.name}\n*البريد:* ${formData.email}\n*الهاتف:* ${normalizedPhone}\n\n*المنتجات:*\n${productsList}\n\n*المجموع:* ${getCartTotal()} د.ل\n\n${formData.notes ? `*ملاحظات:* ${formData.notes}\n\n` : ''}---\nتم الإرسال من موقع الإندماج التقني`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

      toast.success(isRTL ? 'تم إرسال الطلب بنجاح!' : 'Order sent successfully!', { duration: 3000 });
      clearCart();
      setTimeout(() => navigate('/shop'), 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'فشل إرسال الطلب' : 'Failed to send order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {isRTL ? 'السلة فارغة' : 'Cart is Empty'}
            </h2>
            <button onClick={() => navigate('/shop')} className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition">
              {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isRTL ? 'إتمام الطلب' : 'Checkout'}
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {isRTL ? 'بياناتك' : 'Your Information'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" required dir={isRTL ? 'rtl' : 'ltr'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {isRTL ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'} *
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" placeholder="+218912345678" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
                </label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" rows={4} dir={isRTL ? 'rtl' : 'ltr'} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'تأكيد الطلب وإرسال عبر واتساب' : 'Confirm Order & Send via WhatsApp')}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-32">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={isRTL ? item.name_ar : item.name_en} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-white">{isRTL ? item.name_ar : item.name_en}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الكمية' : 'Qty'}: {item.quantity}</p>
                      <p className="font-bold text-blue-600">{item.price * item.quantity} {isRTL ? 'د.ل' : 'LYD'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{getCartTotal()} {isRTL ? 'د.ل' : 'LYD'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{isRTL ? 'التوصيل' : 'Delivery'}</span>
                  <span className="text-green-600">{isRTL ? 'مجاني' : 'Free'}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white mt-4">
                <span>{isRTL ? 'المجموع الكلي' : 'Total'}</span>
                <span className="text-blue-600">{getCartTotal()} {isRTL ? 'د.ل' : 'LYD'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
