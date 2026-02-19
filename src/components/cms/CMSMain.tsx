import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import CMSLayout from './CMSLayout';
import CMSDashboard from './CMSDashboard';
import ProductsManager from './ProductsManager';
import OrdersManager from './OrdersManager';
import ClientsManager from './ClientsManager';
import ProjectsManager from './ProjectsManager';
import TeamManager from './TeamManager';
import TestimonialsManager from './TestimonialsManager';
import FAQManager from './FAQManager';
import SettingsManager from './SettingsManager';
import MessagesManager from './MessagesManager';
import TicketsManager from './TicketsManager';
import VideosManager from './VideosManager';
import BlogManager from './BlogManager';

interface CMSMainProps {
  onLogout: () => void;
}

const CMSMain: React.FC<CMSMainProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  const [triggerOpenForm, setTriggerOpenForm] = useState<string | null>(null);

  const handleTabChange = useCallback((newTab: string, openForm?: boolean) => {
    setActiveTab(newTab);
    setTabHistory(prev => [...prev, newTab]);
    if (openForm) {
      setTriggerOpenForm(newTab);
    } else {
      setTriggerOpenForm(null);
    }
    window.history.pushState({ tab: newTab, cms: true, openForm }, '', `/dashboard#${newTab}`);
  }, []);

  useEffect(() => {
    window.history.replaceState({ tab: 'dashboard', cms: true }, '', '/dashboard#dashboard');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.cms) {
        setActiveTab(event.state.tab || 'dashboard');
      } else {
        if (tabHistory.length > 1) {
          const newHistory = [...tabHistory];
          newHistory.pop();
          const previousTab = newHistory[newHistory.length - 1] || 'dashboard';
          setTabHistory(newHistory);
          setActiveTab(previousTab);
          window.history.pushState({ tab: previousTab, cms: true }, '', `/dashboard#${previousTab}`);
        } else {
          window.history.pushState({ tab: 'dashboard', cms: true }, '', '/dashboard#dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [tabHistory]);

  const shouldOpenForm = triggerOpenForm === activeTab;

  useEffect(() => {
    if (triggerOpenForm && triggerOpenForm === activeTab) {
      const timer = setTimeout(() => {
        setTriggerOpenForm(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [triggerOpenForm, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CMSDashboard onTabChange={handleTabChange} />;
      case 'messages':
        return <MessagesManager />;
      case 'tickets':
        return <TicketsManager />;
      case 'products':
        return <ProductsManager openFormOnMount={shouldOpenForm} />;
      case 'orders':
        return <OrdersManager />;
      case 'clients':
        return <ClientsManager openFormOnMount={shouldOpenForm} />;
      case 'projects':
        return <ProjectsManager openFormOnMount={shouldOpenForm} />;
      case 'team':
        return <TeamManager openFormOnMount={shouldOpenForm} />;
      case 'testimonials':
        return <TestimonialsManager />;
      case 'faq':
        return <FAQManager />;
      case 'videos':
        return <VideosManager />;
      case 'blog':
        return <BlogManager />;
      case 'settings':
        return <SettingsManager />;
      case 'preview':
        return <LivePreview />;
      default:
        return <CMSDashboard onTabChange={handleTabChange} />;
    }
  };

  return (
    <>
      <CMSLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      >
        {renderContent()}
      </CMSLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff'
          }
        }}
      />
    </>
  );
};

// Placeholder Component
const PlaceholderContent: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚀</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          هذا القسم قيد التطوير ويمكن توصيله بقاعدة البيانات لإدارة المحتوى
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          This section is under development and can be connected to Supabase for content management
        </p>
      </div>
    </div>
  );
};

// Live Preview Component
const LivePreview: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">معاينة الموقع</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          انقر على الزر أدناه للعودة إلى الموقع الرئيسي
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition"
        >
          فتح الموقع في نافذة جديدة
        </a>
      </div>
    </div>
  );
};

export default CMSMain;
