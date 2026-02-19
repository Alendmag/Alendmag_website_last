import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Edit, Trash2, Save, X, Link } from 'lucide-react';
import { supportVideos as supportVideosApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface Video {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  youtube_url: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const VideosManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const emptyVideo = {
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    youtube_url: '',
    category: 'general',
    order_index: 0,
    is_active: true
  };

  const [formData, setFormData] = useState(emptyVideo);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await supportVideosApi.list();
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error(isRTL ? 'فشل تحميل الفيديوهات' : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVideo) {
        await supportVideosApi.update(editingVideo.id, formData);
        toast.success(isRTL ? 'تم تحديث الفيديو' : 'Video updated');
      } else {
        await supportVideosApi.create(formData);
        toast.success(isRTL ? 'تم إضافة الفيديو' : 'Video added');
      }

      setShowForm(false);
      setEditingVideo(null);
      setFormData(emptyVideo);
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error(isRTL ? 'فشل حفظ الفيديو' : 'Failed to save video');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الفيديو؟' : 'Are you sure you want to delete this video?')) return;

    try {
      await supportVideosApi.remove(id);
      toast.success(isRTL ? 'تم حذف الفيديو' : 'Video deleted');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(isRTL ? 'فشل حذف الفيديو' : 'Failed to delete video');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await supportVideosApi.update(id, { is_active: !isActive });
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    if (videoIdMatch) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
    }
    return null;
  };

  const categories = [
    { value: 'general', labelAr: 'عام', labelEn: 'General' },
    { value: 'tutorials', labelAr: 'دروس تعليمية', labelEn: 'Tutorials' },
    { value: 'faq', labelAr: 'أسئلة شائعة', labelEn: 'FAQ' },
    { value: 'products', labelAr: 'شرح المنتجات', labelEn: 'Product Guides' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'فيديوهات الدعم' : 'Support Videos'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة الفيديوهات التعليمية' : 'Manage tutorial videos'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVideo(null);
            setFormData(emptyVideo);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          {isRTL ? 'إضافة فيديو' : 'Add Video'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingVideo ? (isRTL ? 'تعديل الفيديو' : 'Edit Video') : (isRTL ? 'إضافة فيديو جديد' : 'Add New Video')}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingVideo(null);
                setFormData(emptyVideo);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'رابط يوتيوب' : 'YouTube URL'} *
              </label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                {formData.youtube_url && getYouTubeThumbnail(formData.youtube_url) && (
                  <img
                    src={getYouTubeThumbnail(formData.youtube_url) || ''}
                    alt="Thumbnail"
                    className="w-32 h-20 object-cover rounded-xl"
                  />
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {isRTL ? cat.labelAr : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الترتيب' : 'Order'}
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {isRTL ? 'نشط' : 'Active'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVideo(null);
                  setFormData(emptyVideo);
                }}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                <Save className="w-5 h-5" />
                {isRTL ? 'حفظ' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
              !video.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
              {getYouTubeThumbnail(video.youtube_url) ? (
                <img
                  src={getYouTubeThumbnail(video.youtube_url) || ''}
                  alt={isRTL ? video.title_ar : video.title_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <Play className="w-16 h-16 text-white" />
              </div>
              {!video.is_active && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                  {isRTL ? 'غير نشط' : 'Inactive'}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                {isRTL ? video.title_ar : video.title_en}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {isRTL ? video.description_ar : video.description_en}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {categories.find(c => c.value === video.category)?.[isRTL ? 'labelAr' : 'labelEn']}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(video.id, video.is_active)}
                    className={`p-2 rounded-lg transition ${
                      video.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {video.is_active ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingVideo(video);
                      setFormData({
                        title_ar: video.title_ar,
                        title_en: video.title_en,
                        description_ar: video.description_ar || '',
                        description_en: video.description_en || '',
                        youtube_url: video.youtube_url,
                        category: video.category,
                        order_index: video.order_index,
                        is_active: video.is_active
                      });
                      setShowForm(true);
                    }}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isRTL ? 'لا توجد فيديوهات' : 'No videos yet'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            {isRTL ? 'إضافة أول فيديو' : 'Add First Video'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideosManager;
