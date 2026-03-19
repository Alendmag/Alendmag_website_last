import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, Tag, BookOpen, ArrowLeft, Eye, Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { blogPosts as blogPostsApi } from '../../lib/api';
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

const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await blogPostsApi.get(slug);

        if (data) {
          setPost(data);
          fetchRelated(data.category, data.id);
          incrementViewCount(data.id);
        }
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const incrementViewCount = async (postId: string) => {
    try {
      await blogPostsApi.update(postId, { increment_views: true });
    } catch {
      // silently ignore view count errors
    }
  };

  const fetchRelated = async (category: string, excludeId: string) => {
    try {
      const result = await blogPostsApi.list({ category, limit: 5 });
      const data = (result as any)?.data || result;
      setRelatedPosts((data || []).filter((p: any) => p.id !== excludeId).slice(0, 3));
    } catch {
      setRelatedPosts([]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isRTL
      ? date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const currentUrl = window.location.href;
  const postTitle = post ? (isRTL ? post.title_ar : post.title_en) : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            {isRTL ? 'المقال غير موجود' : 'Article not found'}
          </h2>
          <Link to="/blog" className="text-blue-600 hover:underline">
            {isRTL ? 'العودة إلى المدونة' : 'Back to Blog'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-blue-600">{isRTL ? 'الرئيسية' : 'Home'}</Link>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/blog" className="hover:text-blue-600">{isRTL ? 'المدونة' : 'Blog'}</Link>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-blue-600 truncate max-w-xs">{isRTL ? post.title_ar : post.title_en}</span>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {post.image_url && (
            <div className="relative h-72 md:h-96">
              <img
                src={post.image_url}
                alt={isRTL ? post.title_ar : post.title_en}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'}`}>
                <span className={`px-4 py-2 ${categoryColors[post.category] || 'bg-blue-600'} text-white text-sm font-semibold rounded-full`}>
                  {isRTL ? (categoryLabels[post.category]?.ar || post.category) : (categoryLabels[post.category]?.en || post.category)}
                </span>
              </div>
            </div>
          )}

          <div className="p-8 md:p-12">
            {!post.image_url && (
              <span className={`inline-block px-4 py-2 ${categoryColors[post.category] || 'bg-blue-600'} text-white text-sm font-semibold rounded-full mb-6`}>
                {isRTL ? (categoryLabels[post.category]?.ar || post.category) : (categoryLabels[post.category]?.en || post.category)}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {isRTL ? post.title_ar : post.title_en}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{isRTL ? 'فريق الإندماج التقني' : 'Alendmag Team'}</span>
                </div>
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                )}
                {(post as any).view_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{(post as any).view_count} {isRTL ? 'مشاهدة' : 'views'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  {isRTL ? 'مشاركة' : 'Share'}
                </span>
                <button
                  onClick={shareOnTwitter}
                  className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition"
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  title={isRTL ? 'نسخ الرابط' : 'Copy link'}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {(isRTL ? post.excerpt_ar : post.excerpt_en) && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium border-l-4 border-blue-600 pl-6">
                {isRTL ? post.excerpt_ar : post.excerpt_en}
              </p>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {isRTL ? post.content_ar : post.content_en}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  {isRTL ? 'شارك هذا المقال' : 'Share this article'}
                </span>
                <button onClick={shareOnTwitter} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button onClick={shareOnFacebook} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                  {copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ الرابط' : 'Copy link')}
                </button>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow hover:shadow-md transition border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'العودة إلى المدونة' : 'Back to Blog'}
          </button>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {isRTL ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                    {related.image_url ? (
                      <img src={related.image_url} alt={isRTL ? related.title_ar : related.title_en} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-blue-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {isRTL ? related.title_ar : related.title_en}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      {related.published_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(related.published_at)}
                        </p>
                      )}
                      {(related as any).view_count !== undefined && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(related as any).view_count}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
