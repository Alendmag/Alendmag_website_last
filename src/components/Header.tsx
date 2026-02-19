import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, ShoppingCart, ChevronDown, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'logo_url')
          .maybeSingle();

        if (data?.setting_value) {
          setLogoUrl(data.setting_value);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const isRTL = i18n.language === 'ar';
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: isRTL ? 'الرئيسية' : 'Home', path: '/' },
    { name: isRTL ? 'الخدمات' : 'Services', path: '#services', hasDropdown: true },
    { name: isRTL ? 'أعمالنا' : 'Portfolio', path: '#portfolio' },
    { name: isRTL ? 'المدونة' : 'Blog', path: '/blog' },
    { name: isRTL ? 'الدعم الفني' : 'Support', path: '#support' },
    { name: isRTL ? 'من نحن' : 'About Us', path: '#contact' },
    { name: isRTL ? 'المتجر' : 'Shop', path: '/shop' }
  ];

  const services = [
    { name: t('services.items.customSoftware.title'), icon: '💻' },
    { name: t('services.items.erp.title'), icon: '📊' },
    { name: t('services.items.security.title'), icon: '🔒' },
    { name: t('services.items.attendance.title'), icon: '⏰' },
    { name: t('services.items.networking.title'), icon: '🌐' },
    { name: t('services.items.accounting.title'), icon: '💰' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+218920910096" className="hover:text-blue-200 transition flex items-center gap-1">
              <span>+218920910096</span>
            </a>
            <a href="mailto:info@alendmag.com" className="hover:text-blue-200 transition hidden sm:block">info@alendmag.com</a>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="opacity-80">{isRTL ? 'ليبيا, طرابلس, السياحية' : 'Tripoli, Libya'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoUrl}
              alt="Alendmag Tech Logo"
              className="w-12 h-12 animate-spin-slow group-hover:scale-110 transition object-contain mix-blend-multiply dark:mix-blend-screen"
              style={{ backgroundColor: 'transparent' }}
            />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                {t('common.companyName')}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                {isRTL ? 'لتكنولوجيا معلومات الأعمال' : 'Business IT Solutions'}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => (
              <div key={link.name} className="relative flex items-center">
                {link.hasDropdown ? (
                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <a
                      href={link.path}
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1 whitespace-nowrap"
                    >
                      {link.name}
                      <ChevronDown className="w-4 h-4" />
                    </a>
                    {isServicesOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-2 z-50 border border-gray-100 dark:border-gray-700">
                        {services.map((service) => (
                          <a
                            key={service.name}
                            href="#services"
                            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <div className="text-2xl mb-1">{service.icon}</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">{service.name}</div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : link.path === '#support' ? (
                  <a
                    href={link.path}
                    className="px-3 py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Headphones className="w-4 h-4" />
                    {link.name}
                  </a>
                ) : link.path.startsWith('/') ? (
                  <Link
                    to={link.path}
                    className={`px-3 py-2 rounded-lg transition flex items-center whitespace-nowrap ${
                      location.pathname === link.path
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.path}
                    className="px-3 py-2 rounded-lg transition flex items-center whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.name}
                  </a>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden lg:flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition text-sm whitespace-nowrap"
            >
              {isRTL ? 'لوحة التحكم' : 'Dashboard'}
            </Link>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.path.startsWith('/') ? (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.path}
                    className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )
              ))}
              <Link
                to="/dashboard"
                className="mx-4 mt-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
