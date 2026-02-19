import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  image_url?: string;
  category: string;
  published_at: string;
  tags?: string[];
}

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

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title_ar, title_en, excerpt_ar, excerpt_en, image_url, category, published_at, tags')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isRTL
      ? date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            {isRTL ? 'المدونة والأخبار' : 'Blog & News'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('blog.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800">
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
                  {isRTL
                    ? (categoryLabels[post.category]?.ar || post.category)
                    : (categoryLabels[post.category]?.en || post.category)
                  }
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                  {isRTL ? post.title_ar : post.title_en}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">
                  {isRTL ? post.excerpt_ar : post.excerpt_en}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'فريق الإندماج التقني' : 'Alendmag Team'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  </div>
                  <Link to={`/blog/${post.id}`} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium hover:gap-2 transition-all">
                    {isRTL ? 'اقرأ المزيد' : 'Read more'}
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300"
          >
            {isRTL ? 'عرض جميع المقالات' : 'View All Articles'}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
