import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowRight, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <div className="text-[180px] font-black leading-none select-none bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-700 bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Search className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
          {isRTL
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها إلى مكان آخر.'
            : 'Sorry, the page you are looking for does not exist or may have been moved.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            {isRTL ? 'العودة إلى الرئيسية' : 'Back to Home'}
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isRTL ? 'تصفح المتجر' : 'Browse Shop'}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          {[
            { to: '/', label: isRTL ? 'الرئيسية' : 'Home' },
            { to: '/shop', label: isRTL ? 'المتجر' : 'Shop' },
            { to: '/blog', label: isRTL ? 'المدونة' : 'Blog' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
