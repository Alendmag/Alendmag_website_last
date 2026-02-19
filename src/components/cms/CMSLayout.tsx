import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Settings,
  Users,
  Eye,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Package,
  ShoppingCart,
  UserCheck,
  Mail,
  Ticket,
  Play,
  Headphones,
  BookOpen
} from 'lucide-react';

interface CMSLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const CMSLayout: React.FC<CMSLayoutProps> = ({ activeTab, onTabChange, onLogout, children }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: isRTL ? 'لوحة التحكم' : 'Dashboard' },
    { id: 'messages', icon: Mail, label: isRTL ? 'الرسائل' : 'Messages', badge: true },
    { id: 'tickets', icon: Ticket, label: isRTL ? 'تذاكر الدعم' : 'Tickets', badge: true },
    { id: 'products', icon: Package, label: isRTL ? 'المنتجات' : 'Products' },
    { id: 'orders', icon: ShoppingCart, label: isRTL ? 'الطلبات' : 'Orders' },
    { id: 'clients', icon: UserCheck, label: isRTL ? 'العملاء' : 'Clients' },
    { id: 'projects', icon: FolderOpen, label: isRTL ? 'المشاريع' : 'Projects' },
    { id: 'team', icon: Users, label: isRTL ? 'الفريق' : 'Team' },
    { id: 'testimonials', icon: MessageSquare, label: isRTL ? 'الشهادات' : 'Testimonials' },
    { id: 'faq', icon: HelpCircle, label: isRTL ? 'الأسئلة الشائعة' : 'FAQ' },
    { id: 'blog', icon: BookOpen, label: isRTL ? 'المدونة' : 'Blog' },
    { id: 'videos', icon: Play, label: isRTL ? 'فيديوهات الدعم' : 'Support Videos' },
    { id: 'settings', icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings' },
    { id: 'preview', icon: Eye, label: isRTL ? 'معاينة الموقع' : 'Live Preview' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {isRTL ? 'لوحة التحكم' : 'CMS'}
        </h1>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen w-64 bg-white dark:bg-gray-800 border-${isRTL ? 'l' : 'r'} border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-40 ${
            sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {isRTL ? 'لوحة التحكم' : 'CMS Panel'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isRTL ? 'مرحباً، admin' : 'Welcome, admin'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CMSLayout;
