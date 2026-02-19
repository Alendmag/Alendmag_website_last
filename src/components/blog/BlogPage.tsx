import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, BookOpen, Search, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/supabase';

const categoryColors: { [key: string]: string } = {
  technology: 'bg-blue-600',
  security: 'bg-red-600',
  software: 'bg-green-600',
  business: 'bg-orange-600',
  general: 'bg-gray-600'
};

const categoryLabels: { [key: string]: { ar: string; en: string } } = {
  technology: { ar: 'تكنولوجيا', en: 'Technology' },
  security: { ar: 'أمن المعلومات', en: 'Security' },
  software: { ar: 'برمجيات الأعمال', en: 'Business Software' },
  business: { ar: 'الأعمال', en: 'Business' },
  general: { ar: 'عام', en: 'General' }
};

const BlogPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        if (error) throw error;
        setPosts(data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(posts.map(p => p.category))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = isRTL ? post.title_ar : post.title_en;
      const excerpt = isRTL ? (post.excerpt_ar || '') : (post.excerpt_en || '');
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory, isRTL]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isRTL
      ? date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            {isRTL ? 'المدونة والأخبار' : 'Blog & News'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? 'مدونة الإندماج التقني' : 'Alendmag Tech Blog'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isRTL ? 'آخر الأخبار والمقالات التقنية والنصائح لأعمالك' : 'Latest news, technical articles and business tips'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={isRTL ? 'ابحث في المقالات...' : 'Search articles...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium transition text-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-medium transition text-sm ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                {isRTL ? (categoryLabels[cat]?.ar || cat) : (categoryLabels[cat]?.en || cat)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {isRTL ? 'لا توجد مقالات' : 'No articles found'}
            </p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.id}`}
                className="group block mb-12 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
              >
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-72 lg:h-auto bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                    {featuredPost.image_url ? (
                      <img
                        src={featuredPost.image_url}
                        alt={isRTL ? featuredPost.title_ar : featuredPost.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-24 h-24 text-blue-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'}`}>
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase">
                        {isRTL ? 'مميز' : 'Featured'}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <span className={`inline-block px-3 py-1 ${categoryColors[featuredPost.category] || 'bg-blue-600'} text-white text-xs font-semibold rounded-full mb-4 w-fit`}>
                      {isRTL ? (categoryLabels[featuredPost.category]?.ar || featuredPost.category) : (categoryLabels[featuredPost.category]?.en || featuredPost.category)}
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                      {isRTL ? featuredPost.title_ar : featuredPost.title_en}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3">
                      {isRTL ? featuredPost.excerpt_ar : featuredPost.excerpt_en}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{isRTL ? 'فريق الإندماج' : 'Alendmag Team'}</span>
                        </div>
                        {featuredPost.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(featuredPost.published_at)}</span>
                          </div>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                        {isRTL ? 'اقرأ المزيد' : 'Read more'}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {restPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={isRTL ? post.title_ar : post.title_en}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-blue-300 dark:text-gray-600" />
                        </div>
                      )}
                      <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1 ${categoryColors[post.category] || 'bg-blue-600'} text-white text-xs font-medium rounded-full`}>
                        {isRTL ? (categoryLabels[post.category]?.ar || post.category) : (categoryLabels[post.category]?.en || post.category)}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                        {isRTL ? post.title_ar : post.title_en}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">
                        {isRTL ? post.excerpt_ar : post.excerpt_en}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-blue-600 dark:text-blue-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'فريق الإندماج' : 'Alendmag Team'}</span>
                          </div>
                          {post.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                          {isRTL ? 'اقرأ' : 'Read'}
                          <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
