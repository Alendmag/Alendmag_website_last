import React from 'react';
import { Cpu, Phone, Shield, Cloud, Zap, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const services = [
    {
      icon: Cpu,
      titleAr: 'حلول برمجية مخصصة',
      titleEn: 'Custom Software Solutions',
      descAr: 'تطوير برامج مخصصة تناسب احتياجات عملك',
      descEn: 'Develop customized software tailored to your business needs'
    },
    {
      icon: Cloud,
      titleAr: 'خدمات السحابة',
      titleEn: 'Cloud Services',
      descAr: 'استضافة آمنة وموثوقة على السحابة',
      descEn: 'Secure and reliable cloud hosting services'
    },
    {
      icon: Shield,
      titleAr: 'أنظمة الحماية',
      titleEn: 'Security Systems',
      descAr: 'حماية متقدمة لبيانات عملك وأنظمتك',
      descEn: 'Advanced protection for your business data and systems'
    },
    {
      icon: Phone,
      titleAr: 'الدعم الفني',
      titleEn: 'Technical Support',
      descAr: 'فريق دعم متخصص متاح على مدار الساعة',
      descEn: '24/7 specialized technical support team'
    },
    {
      icon: Zap,
      titleAr: 'تحسين الأداء',
      titleEn: 'Performance Optimization',
      descAr: 'تحسين وتسريع أنظمتك الحالية',
      descEn: 'Improve and accelerate your current systems'
    },
    {
      icon: Settings,
      titleAr: 'إدارة الأنظمة',
      titleEn: 'Systems Management',
      descAr: 'إدارة احترافية لكل أنظمة عملك',
      descEn: 'Professional management of all your business systems'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'خدماتنا' : 'Our Services'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {isRTL ? 'نقدم حلولاً متكاملة لجميع احتياجات عملك التقنية' : 'We provide comprehensive solutions for all your technical needs'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition p-8"
              >
                <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {isRTL ? service.titleAr : service.titleEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? service.descAr : service.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
