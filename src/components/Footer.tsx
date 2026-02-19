import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, Phone, MapPin, Mail, Facebook, Twitter, Linkedin, Instagram, ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: t('nav.home'), href: '#' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.contact'), href: '#contact' },
    { name: t('nav.shop'), href: '/shop' }
  ];

  const services = [
    'البرمجيات المخصصة',
    'أنظمة ERP',
    'أنظمة الحماية',
    'الحضور والانصراف',
    'تصميم الشبكات',
    'المحاسبة'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-xl">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xl font-bold">{t('common.companyName')}</div>
                <div className="text-sm text-gray-400">لتكنولوجيا معلومات الأعمال</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              شركة ليبية رائدة في مجال تكنولوجيا المعلومات، نقدم حلول برمجية متكاملة للشركات والمؤسسات.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/17hFCnonnK/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-600 rounded-full group-hover:w-2 transition-all"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href="#services"
                    className="text-gray-400 hover:text-white transition flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-cyan-600 rounded-full group-hover:w-2 transition-all"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-white">{t('contact.info.management')}</div>
                  <a href="tel:00218920910096" className="hover:text-white transition">00218920910096</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-white">{t('contact.info.sales')}</div>
                  <a href="tel:00218920910097" className="hover:text-white transition">00218920910097</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-white">{t('contact.info.support')}</div>
                  <a href="tel:00218920980096" className="hover:text-white transition">00218920980096</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-white">{t('contact.info.email')}</div>
                  <a href="mailto:info@alendmag.ly" className="hover:text-white transition">info@alendmag.ly</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-white">{t('contact.info.address')}</div>
                  <a href="https://maps.app.goo.gl/QneWVbq7T3M4v5LZA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    {t('contact.info.location')}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-12">
          <a
            href="https://maps.app.goo.gl/jwmd1sVyUM1P9pe9A"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-2xl overflow-hidden hover:shadow-2xl transition group"
          >
            <div className="relative h-64 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3352.8449795362!2d13.171869076126641!3d32.86441377361595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13a89350da6edfbb%3A0x8b0c7f8b0e0f7f8!2sTripoli%2C%20Libya!5e0!3m2!1sen!2s!4v1701234567890!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-300"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none group-hover:from-gray-900/60 transition"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold">{t('contact.info.address')}</h3>
                </div>
                <p className="text-gray-200">{t('contact.info.location')}</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {t('common.copyright')}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">{t('common.privacyPolicy')}</a>
              <a href="#" className="hover:text-white transition">{t('common.termsOfService')}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transform hover:scale-110 transition flex items-center justify-center z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </footer>
  );
};

export default Footer;
