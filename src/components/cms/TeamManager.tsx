import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Save, X, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { teamMembers as teamMembersApi } from '../../lib/api';
import type { TeamMember } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface TeamManagerProps {
  openFormOnMount?: boolean;
}

const TeamManager: React.FC<TeamManagerProps> = ({ openFormOnMount }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(openFormOnMount || false);

  const emptyMember: Omit<TeamMember, 'id' | 'created_at'> = {
    name_ar: '',
    name_en: '',
    position_ar: '',
    position_en: '',
    photo_url: '',
    bio_ar: '',
    bio_en: '',
    order_index: 0,
    is_active: true
  };

  const [formData, setFormData] = useState(emptyMember);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (openFormOnMount) {
      setShowForm(true);
    }
  }, [openFormOnMount]);

  const fetchMembers = async () => {
    try {
      const data = await teamMembersApi.list();
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error(isRTL ? 'فشل تحميل أعضاء الفريق' : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await teamMembersApi.update(editingMember.id, formData);
        toast.success(isRTL ? 'تم تحديث العضو بنجاح' : 'Member updated successfully');
      } else {
        const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.order_index)) : 0;
        await teamMembersApi.create({ ...formData, order_index: maxOrder + 1 });
        toast.success(isRTL ? 'تم إضافة العضو بنجاح' : 'Member added successfully');
      }

      setShowForm(false);
      setEditingMember(null);
      setFormData(emptyMember);
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(isRTL ? 'فشل حفظ العضو' : 'Failed to save member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا العضو؟' : 'Are you sure you want to delete this member?')) return;

    try {
      await teamMembersApi.remove(id);
      toast.success(isRTL ? 'تم حذف العضو بنجاح' : 'Member deleted successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(isRTL ? 'فشل حذف العضو' : 'Failed to delete member');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name_ar: member.name_ar,
      name_en: member.name_en,
      position_ar: member.position_ar,
      position_en: member.position_en,
      photo_url: member.photo_url || '',
      bio_ar: member.bio_ar || '',
      bio_en: member.bio_en || '',
      order_index: member.order_index,
      is_active: member.is_active
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormData(emptyMember);
  };

  const moveUp = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex <= 0) return;

    const previousMember = members[currentIndex - 1];

    try {
      await teamMembersApi.update(member.id, { order_index: previousMember.order_index });
      await teamMembersApi.update(previousMember.id, { order_index: member.order_index });
      fetchMembers();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error(isRTL ? 'فشل تغيير الترتيب' : 'Failed to reorder');
    }
  };

  const moveDown = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex >= members.length - 1) return;

    const nextMember = members[currentIndex + 1];

    try {
      await teamMembersApi.update(member.id, { order_index: nextMember.order_index });
      await teamMembersApi.update(nextMember.id, { order_index: member.order_index });
      fetchMembers();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error(isRTL ? 'فشل تغيير الترتيب' : 'Failed to reorder');
    }
  };

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
            {isRTL ? 'إدارة الفريق' : 'Team Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة أعضاء الفريق وصورهم' : 'Manage team members and their photos'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة عضو' : 'Add Member'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{members.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي الأعضاء' : 'Total Members'}</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => m.is_active).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'أعضاء نشطون' : 'Active Members'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingMember ? (isRTL ? 'تعديل عضو' : 'Edit Member') : (isRTL ? 'عضو جديد' : 'New Member')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الاسم بالعربية' : 'Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الاسم بالإنجليزية' : 'Name (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'المنصب بالعربية' : 'Position (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.position_ar}
                  onChange={(e) => setFormData({ ...formData, position_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'المنصب بالإنجليزية' : 'Position (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.position_en}
                  onChange={(e) => setFormData({ ...formData, position_en: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'رابط الصورة' : 'Photo URL'} *
              </label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="https://example.com/photo.jpg"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isRTL ? 'استخدم روابط من Pexels أو مواقع الصور المجانية' : 'Use links from Pexels or free stock photo sites'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'النبذة بالعربية' : 'Bio (Arabic)'}
                </label>
                <textarea
                  value={formData.bio_ar}
                  onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  rows={3}
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'النبذة بالإنجليزية' : 'Bio (English)'}
                </label>
                <textarea
                  value={formData.bio_en}
                  onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'عضو نشط' : 'Active Member'}
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
              >
                <Save className="w-5 h-5" />
                {isRTL ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <X className="w-5 h-5" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition"
          >
            <div className="relative">
              <img
                src={member.photo_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={isRTL ? member.name_ar : member.name_en}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <span className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} px-3 py-1 rounded-full text-xs font-medium ${
                member.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-400'
              }`}>
                {member.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {isRTL ? member.name_ar : member.name_en}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                {isRTL ? member.position_ar : member.position_en}
              </p>
              {(member.bio_ar || member.bio_en) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {isRTL ? member.bio_ar : member.bio_en}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveUp(member)}
                  disabled={index === 0}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(member)}
                  disabled={index === members.length - 1}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'لا يوجد أعضاء فريق. ابدأ بإضافة عضو جديد!' : 'No team members yet. Start by adding a new member!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
