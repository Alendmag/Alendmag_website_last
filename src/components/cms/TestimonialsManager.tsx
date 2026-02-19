import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Save, X, Star, MessageSquare } from 'lucide-react';
import { testimonials as testimonialsApi } from '../../lib/api';
import type { Testimonial } from '../../lib/supabase';
import toast from 'react-hot-toast';

const TestimonialsManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const emptyForm = { client_name: '', client_position: '', client_company: '', client_photo: '', content_ar: '', content_en: '', rating: 5, is_featured: false, is_active: true, order_index: 0 };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await testimonialsApi.list();
      setTestimonials(data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل التحميل' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await testimonialsApi.update(editing.id, formData);
        toast.success(isRTL ? 'تم التحديث' : 'Updated');
      } else {
        await testimonialsApi.create(formData);
        toast.success(isRTL ? 'تم الإضافة' : 'Added');
      }
      setShowForm(false);
      setEditing(null);
      setFormData(emptyForm);
      fetchTestimonials();
    } catch (error) {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try {
      await testimonialsApi.remove(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      fetchTestimonials();
    } catch (error) {
      toast.error(isRTL ? 'فشل الحذف' : 'Failed');
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setFormData({ client_name: item.client_name, client_position: item.client_position || '', client_company: item.client_company || '', client_photo: item.client_photo || '', content_ar: item.content_ar, content_en: item.content_en, rating: item.rating, is_featured: item.is_featured, is_active: item.is_active, order_index: item.order_index });
    setShowForm(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isRTL ? 'إدارة الشهادات' : 'Testimonials'}</h1></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"><Plus className="w-5 h-5" />{isRTL ? 'إضافة' : 'Add'}</button>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><MessageSquare className="w-10 h-10 text-blue-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي' : 'Total'}</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><Star className="w-10 h-10 text-yellow-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.filter(t => t.is_featured).length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'مميزة' : 'Featured'}</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><MessageSquare className="w-10 h-10 text-green-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.filter(t => t.is_active).length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'نشطة' : 'Active'}</div></div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editing ? (isRTL ? 'تعديل' : 'Edit') : (isRTL ? 'جديد' : 'New')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} placeholder={isRTL ? 'الاسم' : 'Name'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" required />
              <input type="text" value={formData.client_position} onChange={(e) => setFormData({ ...formData, client_position: e.target.value })} placeholder={isRTL ? 'المنصب' : 'Position'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" />
              <input type="text" value={formData.client_company} onChange={(e) => setFormData({ ...formData, client_company: e.target.value })} placeholder={isRTL ? 'الشركة' : 'Company'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" />
            </div>
            <input type="url" value={formData.client_photo} onChange={(e) => setFormData({ ...formData, client_photo: e.target.value })} placeholder={isRTL ? 'رابط الصورة' : 'Photo URL'} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" />
            <div className="grid md:grid-cols-2 gap-4">
              <textarea value={formData.content_ar} onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })} placeholder={isRTL ? 'المحتوى بالعربية' : 'Content (Arabic)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" rows={4} required dir="rtl" />
              <textarea value={formData.content_en} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} placeholder={isRTL ? 'المحتوى بالإنجليزية' : 'Content (English)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" rows={4} required />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} /><span className="text-sm">{isRTL ? 'مميزة' : 'Featured'}</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /><span className="text-sm">{isRTL ? 'نشط' : 'Active'}</span></label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"><Save className="w-5 h-5" />{isRTL ? 'حفظ' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormData(emptyForm); }} className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl"><X className="w-5 h-5" />{isRTL ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
            <div className="flex items-start gap-4 mb-4">
              <img src={item.client_photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100'} alt={item.client_name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{item.client_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.client_position}</p>
                <p className="text-xs text-gray-500">{item.client_company}</p>
              </div>
              {item.is_featured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{isRTL ? item.content_ar : item.content_en}</p>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-sm"><Edit className="w-4 h-4 inline mr-1" />{isRTL ? 'تعديل' : 'Edit'}</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg text-sm"><Trash2 className="w-4 h-4 inline mr-1" />{isRTL ? 'حذف' : 'Delete'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsManager;
