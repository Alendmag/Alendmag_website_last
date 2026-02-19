import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [contactSettings, setContactSettings] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('category', 'contact');

      if (data) {
        const settings: {[key: string]: string} = {};
        data.forEach(item => {
          settings[item.setting_key] = item.setting_value || '';
        });
        setContactSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message
        }]);

      if (error) throw error;

      toast.success(isRTL ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً' : 'Message sent successfully! We will contact you soon');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isRTL ? 'فشل إرسال الرسالة. يرجى المحاولة مجدداً' : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.info.phone'),
      content: contactSettings.phone || '+218 91-234-5678',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Mail,
      title: t('contact.info.email'),
      content: contactSettings.email || 'info@alendmag.ly',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MapPin,
      title: t('contact.info.address'),
      content: isRTL ? (contactSettings.address_ar || 'طرابلس، ليبيا') : (contactSettings.address_en || 'Tripoli, Libya'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: t('contact.info.workingHours'),
      content: isRTL ? (contactSettings.working_hours_ar || 'الأحد - الخميس: 9:00 - 17:00') : (contactSettings.working_hours_en || 'Sun - Thu: 9:00 - 17:00'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">تواصل معنا</h3>
              <p className="mb-8 opacity-90">
                نحن هنا لمساعدتك! تواصل معنا عبر أي من الطرق التالية وسنكون سعداء بخدمتك.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
                      <Icon className="w-8 h-8 mb-3" />
                      <div className="text-sm opacity-80 mb-1">{info.title}</div>
                      <div className="font-medium">{info.content}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden h-64 shadow-lg">
              {contactSettings.google_maps_embed ? (
                <iframe
                  src={contactSettings.google_maps_embed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3351.8454892841137!2d13.176696315303454!3d32.87519908095016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13a892e27c0c60f5%3A0x8fc8d08ae6e63f5d!2sTripoli%2C%20Libya!5e0!3m2!1sen!2sus!4v1704067200000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps - Tripoli, Libya"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+218 91-234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.subject')} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="موضوع الرسالة"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contact.form.message')} *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
