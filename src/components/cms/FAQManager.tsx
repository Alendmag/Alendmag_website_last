import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Save, X, HelpCircle } from 'lucide-react';
import { faq as faqApi } from '../../lib/api';
import type { FAQ } from '../../lib/supabase';
import toast from 'react-hot-toast';

const FAQManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);

  const emptyForm = { question_ar: '', question_en: '', answer_ar: '', answer_en: '', category: 'general', order_index: 0, is_active: true };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    try {
      const data = await faqApi.list();
      setFaqs(data || []);
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
        await faqApi.update(editing.id, formData);
        toast.success(isRTL ? 'تم التحديث' : 'Updated');
      } else {
        await faqApi.create(formData);
        toast.success(isRTL ? 'تم الإضافة' : 'Added');
      }
      setShowForm(false);
      setEditing(null);
      setFormData(emptyForm);
      fetchFAQs();
    } catch (error) {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try {
      await faqApi.remove(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      fetchFAQs();
    } catch (error) {
      toast.error(isRTL ? 'فشل الحذف' : 'Failed');
    }
  };

  const handleEdit = (item: FAQ) => {
    setEditing(item);
    setFormData({ question_ar: item.question_ar, question_en: item.question_en, answer_ar: item.answer_ar, answer_en: item.answer_en, category: item.category, order_index: item.order_index, is_active: item.is_active });
    setShowForm(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isRTL ? 'الأسئلة الشائعة' : 'FAQ Management'}</h1></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"><Plus className="w-5 h-5" />{isRTL ? 'إضافة' : 'Add'}</button>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><HelpCircle className="w-10 h-10 text-blue-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{faqs.length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي الأسئلة' : 'Total FAQs'}</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><HelpCircle className="w-10 h-10 text-green-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{faqs.filter(f => f.is_active).length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'نشطة' : 'Active'}</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border"><HelpCircle className="w-10 h-10 text-purple-600 mb-3" /><div className="text-3xl font-bold text-gray-900 dark:text-white">{new Set(faqs.map(f => f.category)).size}</div><div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الفئات' : 'Categories'}</div></div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editing ? (isRTL ? 'تعديل' : 'Edit') : (isRTL ? 'جديد' : 'New')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" value={formData.question_ar} onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })} placeholder={isRTL ? 'السؤال بالعربية' : 'Question (Arabic)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" required dir="rtl" />
              <input type="text" value={formData.question_en} onChange={(e) => setFormData({ ...formData, question_en: e.target.value })} placeholder={isRTL ? 'السؤال بالإنجليزية' : 'Question (English)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <textarea value={formData.answer_ar} onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })} placeholder={isRTL ? 'الإجابة بالعربية' : 'Answer (Arabic)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" rows={4} required dir="rtl" />
              <textarea value={formData.answer_en} onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })} placeholder={isRTL ? 'الإجابة بالإنجليزية' : 'Answer (English)'} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white" rows={4} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white">
                <option value="general">{isRTL ? 'عام' : 'General'}</option>
                <option value="support">{isRTL ? 'الدعم' : 'Support'}</option>
                <option value="payment">{isRTL ? 'الدفع' : 'Payment'}</option>
                <option value="technical">{isRTL ? 'تقني' : 'Technical'}</option>
              </select>
              <label className="flex items-center gap-2 px-4"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /><span className="text-sm">{isRTL ? 'نشط' : 'Active'}</span></label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"><Save className="w-5 h-5" />{isRTL ? 'حفظ' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormData(emptyForm); }} className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl"><X className="w-5 h-5" />{isRTL ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-1 gap-4">
        {faqs.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{isRTL ? item.question_ar : item.question_en}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-9">{isRTL ? item.answer_ar : item.answer_en}</p>
                <div className="flex gap-2 mt-3 ml-9">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">{item.category}</span>
                  {item.is_active ? <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">{isRTL ? 'نشط' : 'Active'}</span> : <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-full text-xs">{isRTL ? 'غير نشط' : 'Inactive'}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManager;
