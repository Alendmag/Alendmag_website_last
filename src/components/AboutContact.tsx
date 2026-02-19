import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Eye, Heart, Award, Users, TrendingUp, Phone, Mail, MapPin, Clock, Send, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { siteSettings, contactMessages as contactMessagesApi } from '../lib/api';

const AboutContact: React.FC = () => {
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
      const data = await siteSettings.list('contact');
      if (data) {
        const settings: {[key: string]: string} = {};
        data.forEach((item: any) => {
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
      await contactMessagesApi.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });

      toast.success(isRTL ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً' : 'Message sent successfully! We will contact you soon');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء إرسال الرسالة' : 'Error sending message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const values = [
    { icon: Target, titleAr: 'رسالتنا', titleEn: 'Our Mission', descAr: 'تقديم حلول تقنية مبتكرة تساعد عملائنا على تحقيق أهدافهم', descEn: 'Providing innovative tech solutions to help clients achieve their goals', color: 'from-blue-500 to-cyan-500' },
    { icon: Eye, titleAr: 'رؤيتنا', titleEn: 'Our Vision', descAr: 'أن نكون الشريك التقني الأول في المنطقة', descEn: 'To be the leading technology partner in the region', color: 'from-green-500 to-emerald-500' },
    { icon: Heart, titleAr: 'قيمنا', titleEn: 'Our Values', descAr: 'الجودة والابتكار والالتزام تجاه عملائنا', descEn: 'Quality, innovation, and commitment to our clients', color: 'from-red-500 to-orange-500' }
  ];

  const achievements = [
    { icon: Award, value: '150+', labelAr: 'مشروع منجز', labelEn: 'Projects Completed' },
    { icon: Users, value: '200+', labelAr: 'عميل سعيد', labelEn: 'Happy Clients' },
    { icon: TrendingUp, value: '10+', labelAr: 'سنوات خبرة', labelEn: 'Years Experience' }
  ];

  const contactInfo = [
    {
      icon: Phone,
      titleAr: 'الهاتف',
      titleEn: 'Phone',
      content: '+218920910096',
      href: 'tel:+218920910096',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Mail,
      titleAr: 'البريد الإلكتروني',
      titleEn: 'Email',
      content: 'info@alendmag.com',
      href: 'mailto:info@alendmag.com',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPin,
      titleAr: 'العنوان',
      titleEn: 'Address',
      content: isRTL ? 'ليبيا, طرابلس, السياحية, طريق ابونواس الرئيسي' : 'Libya, Tripoli, Al-Siyahiya, Abu Nawas Main Road',
      href: 'https://maps.google.com/?q=Tripoli,Libya',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Clock,
      titleAr: 'ساعات العمل',
      titleEn: 'Working Hours',
      content: isRTL ? 'الأحد - الخميس: 9:00 - 17:00' : 'Sun - Thu: 9:00 AM - 5:00 PM',
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            {isRTL ? 'تعرف علينا' : 'Get To Know Us'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? 'من نحن' : 'About Us'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isRTL ? 'شركة ليبية رائدة في مجال تكنولوجيا المعلومات، نقدم حلول برمجية متكاملة للشركات والمؤسسات' : 'A leading Libyan company in the field of information technology, providing integrated software solutions for companies and institutions'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 dark:border-gray-700">
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                  {isRTL ? value.titleAr : value.titleEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? value.descAr : value.descEn}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 mb-16 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <Icon className="w-12 h-12 mb-4 opacity-90" />
                  <div className="text-4xl font-bold mb-2">{achievement.value}</div>
                  <div className="text-white/80">{isRTL ? achievement.labelAr : achievement.labelEn}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isRTL ? 'نحن هنا لمساعدتك! تواصل معنا عبر أي من الطرق التالية' : 'We are here to help! Contact us through any of the following methods'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition border border-gray-100 dark:border-gray-700"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {isRTL ? info.titleAr : info.titleEn}
                    </div>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2"
                        dir="ltr"
                      >
                        {info.content}
                        {info.href.startsWith('http') && <ExternalLink className="w-4 h-4" />}
                      </a>
                    ) : (
                      <div className="font-semibold text-gray-800 dark:text-white">{info.content}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl overflow-hidden h-64 shadow-lg border border-gray-200 dark:border-gray-700">
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

          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 shadow-lg space-y-6 border border-gray-100 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الاسم' : 'Name'} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الهاتف' : 'Phone'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+218 xx-xxx-xxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الموضوع' : 'Subject'} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={isRTL ? 'موضوع الرسالة' : 'Message subject'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الرسالة' : 'Message'} *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
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
                  {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  {isRTL ? 'إرسال الرسالة' : 'Send Message'}
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AboutContact;
