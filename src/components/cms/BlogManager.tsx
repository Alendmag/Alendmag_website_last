import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Save, X, BookOpen, Eye, EyeOff, Calendar } from 'lucide-react';
import { blogPosts as blogPostsApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  excerpt_ar: string;
  excerpt_en: string;
  content_ar: string;
  content_en: string;
  image_url?: string;
  category: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  views: number;
  created_at: string;
}

const categories = [
  { value: 'technology', ar: 'تكنولوجيا', en: 'Technology' },
  { value: 'security', ar: 'أمن المعلومات', en: 'Security' },
  { value: 'software', ar: 'برمجيات الأعمال', en: 'Business Software' },
  { value: 'business', ar: 'الأعمال', en: 'Business' },
  { value: 'general', ar: 'عام', en: 'General' }
];

const emptyPost = {
  title_ar: '',
  title_en: '',
  slug: '',
  excerpt_ar: '',
  excerpt_en: '',
  content_ar: '',
  content_en: '',
  image_url: '',
  category: 'technology',
  tags: [] as string[],
  is_published: false
};

const BlogManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyPost);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await blogPostsApi.list();
      setPosts((data as any)?.data || data || []);
    } catch {
      toast.error(isRTL ? 'فشل تحميل المقالات' : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (titleEn: string) => {
    return titleEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.slug || generateSlug(formData.title_en);
      const dataToSave = {
        ...formData,
        slug,
        published_at: formData.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (editingPost) {
        await blogPostsApi.update(editingPost.id, dataToSave);
        toast.success(isRTL ? 'تم تحديث المقال بنجاح' : 'Post updated successfully');
      } else {
        await blogPostsApi.create(dataToSave);
        toast.success(isRTL ? 'تم إضافة المقال بنجاح' : 'Post added successfully');
      }

      setShowForm(false);
      setEditingPost(null);
      setFormData(emptyPost);
      setTagInput('');
      fetchPosts();
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error(isRTL ? 'رابط المقال مستخدم بالفعل' : 'Post slug already exists');
      } else {
        toast.error(isRTL ? 'فشل حفظ المقال' : 'Failed to save post');
      }
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await blogPostsApi.update(post.id, {
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : null
      });
      toast.success(isRTL
        ? (!post.is_published ? 'تم نشر المقال' : 'تم إلغاء نشر المقال')
        : (!post.is_published ? 'Post published' : 'Post unpublished')
      );
      fetchPosts();
    } catch {
      toast.error(isRTL ? 'فشل تغيير حالة المقال' : 'Failed to change post status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this post?')) return;

    try {
      await blogPostsApi.remove(id);
      toast.success(isRTL ? 'تم حذف المقال' : 'Post deleted');
      fetchPosts();
    } catch {
      toast.error(isRTL ? 'فشل حذف المقال' : 'Failed to delete post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title_ar: post.title_ar,
      title_en: post.title_en,
      slug: post.slug,
      excerpt_ar: post.excerpt_ar || '',
      excerpt_en: post.excerpt_en || '',
      content_ar: post.content_ar,
      content_en: post.content_en,
      image_url: post.image_url || '',
      category: post.category || 'technology',
      tags: post.tags || [],
      is_published: post.is_published
    });
    setShowForm(true);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData(emptyPost);
    setTagInput('');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'إدارة المدونة' : 'Blog Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إضافة وإدارة مقالات المدونة' : 'Add and manage blog posts'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'مقال جديد' : 'New Post'}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isRTL ? 'إجمالي المقالات' : 'Total Posts'}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{posts.filter(p => p.is_published).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isRTL ? 'مقالات منشورة' : 'Published'}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-800">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{posts.filter(p => !p.is_published).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isRTL ? 'مسودات' : 'Drafts'}</div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingPost ? (isRTL ? 'تعديل المقال' : 'Edit Post') : (isRTL ? 'مقال جديد' : 'New Post')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان بالعربية' : 'Title (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                  required
                  dir="rtl"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان بالإنجليزية' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={e => setFormData({ ...formData, title_en: e.target.value, slug: generateSlug(e.target.value) })}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الرابط (Slug)' : 'URL Slug'}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  dir="ltr"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="post-url-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {isRTL ? cat.ar : cat.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'رابط الصورة' : 'Image URL'}
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="https://images.pexels.com/..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'مقتطف بالعربية' : 'Excerpt (Arabic)'}
                </label>
                <textarea
                  value={formData.excerpt_ar}
                  onChange={e => setFormData({ ...formData, excerpt_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'مقتطف بالإنجليزية' : 'Excerpt (English)'}
                </label>
                <textarea
                  value={formData.excerpt_en}
                  onChange={e => setFormData({ ...formData, excerpt_en: e.target.value })}
                  rows={3}
                  dir="ltr"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'المحتوى بالعربية' : 'Content (Arabic)'} *
                </label>
                <textarea
                  value={formData.content_ar}
                  onChange={e => setFormData({ ...formData, content_ar: e.target.value })}
                  rows={6}
                  required
                  dir="rtl"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'المحتوى بالإنجليزية' : 'Content (English)'} *
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={e => setFormData({ ...formData, content_en: e.target.value })}
                  rows={6}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الوسوم' : 'Tags'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder={isRTL ? 'أضف وسماً...' : 'Add a tag...'}
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  {isRTL ? 'إضافة' : 'Add'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'نشر المقال فوراً' : 'Publish immediately'}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{isRTL ? 'المقال' : 'Post'}</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{isRTL ? 'التصنيف' : 'Category'}</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {isRTL ? post.title_ar : post.title_en}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {categories.find(c => c.value === post.category)?.[isRTL ? 'ar' : 'en'] || post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      post.is_published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {post.is_published ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`p-2 rounded-lg transition ${
                          post.is_published
                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={post.is_published ? (isRTL ? 'إلغاء النشر' : 'Unpublish') : (isRTL ? 'نشر' : 'Publish')}
                      >
                        {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts.length === 0 && !showForm && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL ? 'لا توجد مقالات. ابدأ بإضافة مقال جديد!' : 'No posts yet. Start by adding a new post!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
