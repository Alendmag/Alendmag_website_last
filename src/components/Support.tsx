import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, HelpCircle, Play, Send, ChevronDown, X, Search, MessageCircle } from 'lucide-react';
import { faq as faqApi, supportVideos as supportVideosApi, supportTickets as supportTicketsApi } from '../lib/api';
import toast from 'react-hot-toast';

interface FAQ {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
}

interface Video {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  youtube_url: string;
  category: string;
}

const Support: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'ticket' | 'faq' | 'videos'>('faq');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoModal, setVideoModal] = useState<Video | null>(null);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFaqs();
    fetchVideos();
  }, []);

  const fetchFaqs = async () => {
    try {
      const data = await faqApi.list({ is_active: true });
      if (data) setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const data = await supportVideosApi.list({ is_active: true });
      if (data) setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube-nocookie.com/embed/${videoIdMatch[1]}?rel=0&modestbranding=1&showinfo=0`;
    }
    return url;
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await supportTicketsApi.create({
        name: ticketForm.name,
        email: ticketForm.email,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        description: ticketForm.description
      });

      toast.success(isRTL ? 'تم إرسال التذكرة بنجاح! سنتواصل معك قريباً' : 'Ticket submitted successfully! We will contact you soon');
      setTicketForm({ name: '', email: '', subject: '', category: 'general', priority: 'medium', description: '' });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء إرسال التذكرة' : 'Error submitting ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const question = isRTL ? faq.question_ar : faq.question_en;
    const answer = isRTL ? faq.answer_ar : faq.answer_en;
    return question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           answer.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    { value: 'general', labelAr: 'استفسار عام', labelEn: 'General Inquiry' },
    { value: 'technical', labelAr: 'مشكلة تقنية', labelEn: 'Technical Issue' },
    { value: 'billing', labelAr: 'الفواتير والمدفوعات', labelEn: 'Billing & Payments' },
    { value: 'feature', labelAr: 'طلب ميزة جديدة', labelEn: 'Feature Request' }
  ];

  const priorities = [
    { value: 'low', labelAr: 'منخفضة', labelEn: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', labelAr: 'متوسطة', labelEn: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', labelAr: 'عالية', labelEn: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', labelAr: 'عاجلة', labelEn: 'Urgent', color: 'bg-red-100 text-red-700' }
  ];

  return (
    <section id="support" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            {isRTL ? 'مركز المساعدة' : 'Help Center'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? 'الدعم الفني' : 'Technical Support'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isRTL ? 'نحن هنا لمساعدتك! تصفح الأسئلة الشائعة أو افتح تذكرة دعم' : 'We are here to help! Browse FAQs or open a support ticket'}
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Play className="w-5 h-5" />
              {isRTL ? 'فيديوهات تعليمية' : 'Tutorials'}
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'ticket'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Ticket className="w-5 h-5" />
              {isRTL ? 'فتح تذكرة' : 'Open Ticket'}
            </button>
          </div>
        </div>

        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث في الأسئلة...' : 'Search questions...'}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {isRTL ? faq.question_ar : faq.question_en}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                        {isRTL ? faq.answer_ar : faq.answer_en}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {isRTL ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setVideoModal(video)}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer group border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                      {isRTL ? video.title_ar : video.title_en}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {isRTL ? video.description_ar : video.description_en}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Play className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد فيديوهات متاحة حالياً' : 'No videos available yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ticket' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleTicketSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg space-y-6 border border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الاسم' : 'Name'} *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'} *
                  </label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الموضوع' : 'Subject'} *
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    {isRTL ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {isRTL ? p.labelAr : p.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'وصف المشكلة' : 'Description'} *
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder={isRTL ? 'اشرح مشكلتك بالتفصيل...' : 'Describe your issue in detail...'}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'إرسال التذكرة' : 'Submit Ticket'}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {videoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
              <button
                onClick={() => setVideoModal(null)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(videoModal.youtube_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={isRTL ? videoModal.title_ar : videoModal.title_en}
                />
              </div>
              <div className="p-6 bg-gray-900">
                <h3 className="text-xl font-bold text-white mb-2">
                  {isRTL ? videoModal.title_ar : videoModal.title_en}
                </h3>
                <p className="text-gray-400">
                  {isRTL ? videoModal.description_ar : videoModal.description_en}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Support;
