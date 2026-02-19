import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import ThemeProvider from './components/ThemeProvider';
import ScrollProgress from './components/ScrollProgress';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Support from './components/Support';
import AboutContact from './components/AboutContact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { useSEO } from './hooks/useSEO';
import { siteSettings } from './lib/api';

const ShopPage = lazy(() => import('./components/shop/ShopPage'));
const ProductDetail = lazy(() => import('./components/shop/ProductDetail'));
const Cart = lazy(() => import('./components/shop/Cart'));
const Checkout = lazy(() => import('./components/shop/Checkout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const BlogPage = lazy(() => import('./components/blog/BlogPage'));
const BlogDetail = lazy(() => import('./components/blog/BlogDetail'));
const NotFound = lazy(() => import('./components/NotFound'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const HomePage: React.FC = () => {
  useSEO({
    title: 'الإندماج التقني - لتكنولوجيا معلومات الأعمال',
    description: 'شركة ليبية رائدة في مجال تكنولوجيا المعلومات، نقدم حلول برمجية متكاملة للشركات والمؤسسات',
    keywords: 'برمجيات, ERP, أنظمة الحماية, تصميم الشبكات, محاسبة, أجهزة الكمبيوتر, نقاط البيع, طرابلس, ليبيا'
  });

  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <Testimonials />
      <Blog />
      <Support />
      <AboutContact />
    </>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const data: any = await siteSettings.get('general', 'logo_url');
        if (data?.setting_value) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.setting_value;
        }
      } catch (error) {
        console.error('Error fetching favicon:', error);
      }
    };

    updateFavicon();
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          {loading && <LoadingScreen />}
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
            <ScrollProgress />
            <Header />

            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
            <WhatsAppButton />

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '10px'
                }
              }}
            />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
