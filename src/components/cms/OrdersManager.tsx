import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Eye, Check, X, Clock, Package } from 'lucide-react';
import { supabase, Order, Product } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Pagination from './shared/Pagination';

const OrdersManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [whatsappNumber, setWhatsappNumber] = useState('218920910096');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchOrders();
    const fetchWhatsapp = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'whatsapp_number')
        .maybeSingle();
      if (data?.setting_value) setWhatsappNumber(data.setting_value);
    };
    fetchWhatsapp();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(isRTL ? 'فشل تحميل الطلبات' : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated');
      fetchOrders();

      // Send WhatsApp notification if order is completed
      if (status === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          sendWhatsAppNotification(order);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(isRTL ? 'فشل تحديث الطلب' : 'Failed to update order');
    }
  };

  const sendWhatsAppNotification = (order: Order) => {
    const productName = order.products
      ? (isRTL ? order.products.name_ar : order.products.name_en)
      : 'Product';

    const message = `
🎉 *طلب جديد مكتمل*

*رقم الطلب:* ${order.id.substring(0, 8)}
*العميل:* ${order.customer_name}
*البريد:* ${order.customer_email}
*الهاتف:* ${order.customer_phone}
*المنتج:* ${productName}
*الكمية:* ${order.quantity}
*المبلغ الإجمالي:* ${order.total_amount.toFixed(2)} د.ل

${order.notes ? `*ملاحظات:* ${order.notes}` : ''}

---
تم الإرسال من نظام إدارة الإندماج التقني
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    toast.success(isRTL ? 'تم فتح واتساب' : 'WhatsApp opened');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return isRTL ? 'مكتمل' : 'Completed';
      case 'processing':
        return isRTL ? 'قيد المعالجة' : 'Processing';
      case 'pending':
        return isRTL ? 'في الانتظار' : 'Pending';
      case 'cancelled':
        return isRTL ? 'ملغي' : 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'إدارة الطلبات' : 'Orders Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'متابعة وإدارة جميع الطلبات' : 'Track and manage all orders'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: isRTL ? 'الإجمالي' : 'Total', value: orders.length, status: 'all', color: 'from-blue-500 to-cyan-500' },
          { label: isRTL ? 'في الانتظار' : 'Pending', value: orders.filter(o => o.status === 'pending').length, status: 'pending', color: 'from-yellow-500 to-orange-500' },
          { label: isRTL ? 'قيد المعالجة' : 'Processing', value: orders.filter(o => o.status === 'processing').length, status: 'processing', color: 'from-blue-500 to-indigo-500' },
          { label: isRTL ? 'مكتمل' : 'Completed', value: orders.filter(o => o.status === 'completed').length, status: 'completed', color: 'from-green-500 to-emerald-500' }
        ].map((stat, index) => (
          <button
            key={index}
            onClick={() => setFilterStatus(stat.status)}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
              filterStatus === stat.status
                ? 'border-blue-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'رقم الطلب' : 'Order ID'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'العميل' : 'Customer'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'المنتج' : 'Product'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'المبلغ' : 'Amount'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.products
                        ? (isRTL ? order.products.name_ar : order.products.name_en)
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isRTL ? 'الكمية' : 'Qty'}: {order.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.total_amount.toFixed(2)} {isRTL ? 'د.ل' : 'LYD'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status !== 'completed' && (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        >
                          <option value="pending">{isRTL ? 'في الانتظار' : 'Pending'}</option>
                          <option value="processing">{isRTL ? 'قيد المعالجة' : 'Processing'}</option>
                          <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                          <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL ? 'لا توجد طلبات' : 'No orders found'}
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => { setCurrentPage(p); }}
        isRTL={isRTL}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    #{selectedOrder.id.substring(0, 8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isRTL ? 'معلومات العميل' : 'Customer Information'}
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الاسم:' : 'Name:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'البريد:' : 'Email:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الهاتف:' : 'Phone:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isRTL ? 'تفاصيل المنتج' : 'Product Details'}
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'المنتج:' : 'Product:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.products
                        ? (isRTL ? selectedOrder.products.name_ar : selectedOrder.products.name_en)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الكمية:' : 'Quantity:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                      {selectedOrder.total_amount.toFixed(2)} {isRTL ? 'د.ل' : 'LYD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isRTL ? 'معلومات الطلب' : 'Order Information'}
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الحالة:' : 'Status:'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'تاريخ الطلب:' : 'Order Date:'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedOrder.created_at).toLocaleString(isRTL ? 'ar-LY' : 'en-US')}
                    </span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">{isRTL ? 'ملاحظات:' : 'Notes:'}</span>
                      <p className="text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => sendWhatsAppNotification(selectedOrder)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
                >
                  {isRTL ? 'إرسال واتساب' : 'Send WhatsApp'}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
