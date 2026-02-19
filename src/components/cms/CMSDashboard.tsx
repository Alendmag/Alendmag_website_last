import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  FolderOpen,
  Users,
  TrendingUp,
  Activity,
  UserCheck,
  MessageSquare,
  Ticket,
  BookOpen,
  Star,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { products as productsApi, orders as ordersApi, clients as clientsApi, projects as projectsApi, teamMembers as teamMembersApi, testimonials as testimonialsApi, faq as faqApi, supportTickets as supportTicketsApi, projectTasks as projectTasksApi, contactMessages as contactMessagesApi, blogPosts as blogPostsApi } from '../../lib/api';

interface CMSDashboardProps {
  onTabChange?: (tab: string, openForm?: boolean) => void;
}

const CMSDashboard: React.FC<CMSDashboardProps> = ({ onTabChange }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    clients: 0,
    projects: 0,
    teamMembers: 0,
    pendingOrders: 0,
    activeProjects: 0,
    testimonials: 0,
    faq: 0,
    supportTickets: 0,
    openTickets: 0,
    projectTasks: 0,
    completedProjects: 0,
    revenue: 0,
    messages: 0,
    unreadMessages: 0,
    blogPosts: 0,
    publishedPosts: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        productsData,
        ordersResult,
        clientsData,
        projectsData,
        teamMembersData,
        testimonialsData,
        faqData,
        supportTicketsResult,
        projectTasksData,
        messagesResult,
        blogPostsResult
      ] = await Promise.all([
        productsApi.list(),
        ordersApi.list(),
        clientsApi.list(),
        projectsApi.list(),
        teamMembersApi.list(),
        testimonialsApi.list(),
        faqApi.list(),
        supportTicketsApi.list(),
        projectTasksApi.list(),
        contactMessagesApi.list(),
        blogPostsApi.list()
      ]);

      const ordersData: any[] = (ordersResult as any)?.data || ordersResult || [];
      const supportTicketsData: any[] = (supportTicketsResult as any)?.data || supportTicketsResult || [];
      const messagesData: any[] = (messagesResult as any)?.data || messagesResult || [];
      const blogPostsData: any[] = (blogPostsResult as any)?.data || blogPostsResult || [];

      const pendingOrdersCount = ordersData.filter((o: any) => o.status === 'pending').length;
      const activeProjectsCount = (projectsData as any[]).filter((p: any) => p.status === 'in-progress').length;
      const completedProjectsCount = (projectsData as any[]).filter((p: any) => p.status === 'completed').length;
      const openTicketsCount = supportTicketsData.filter((t: any) => t.status === 'open').length;
      const unreadMessagesCount = messagesData.filter((m: any) => !m.is_read).length;
      const publishedPostsCount = blogPostsData.filter((p: any) => p.is_published).length;

      const revenue = ordersData
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

      setStats({
        products: (productsData as any[]).length,
        orders: ordersData.length,
        clients: (clientsData as any[]).length,
        projects: (projectsData as any[]).length,
        teamMembers: (teamMembersData as any[]).length,
        pendingOrders: pendingOrdersCount,
        activeProjects: activeProjectsCount,
        testimonials: (testimonialsData as any[]).length,
        faq: (faqData as any[]).length,
        supportTickets: supportTicketsData.length,
        openTickets: openTicketsCount,
        projectTasks: (projectTasksData as any[]).length,
        completedProjects: completedProjectsCount,
        revenue,
        messages: messagesData.length,
        unreadMessages: unreadMessagesCount,
        blogPosts: blogPostsData.length,
        publishedPosts: publishedPostsCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainStats = [
    {
      icon: DollarSign,
      label: isRTL ? 'الإيرادات (مكتملة)' : 'Revenue (Completed)',
      value: `${stats.revenue.toFixed(0)} ${isRTL ? 'د.ل' : 'LYD'}`,
      color: 'from-emerald-500 to-green-600',
      link: 'orders'
    },
    {
      icon: ShoppingCart,
      label: isRTL ? 'إجمالي الطلبات' : 'Total Orders',
      value: stats.orders,
      color: 'from-blue-500 to-cyan-500',
      link: 'orders'
    },
    {
      icon: UserCheck,
      label: isRTL ? 'العملاء' : 'Clients',
      value: stats.clients,
      color: 'from-orange-500 to-amber-500',
      link: 'clients'
    },
    {
      icon: FolderOpen,
      label: isRTL ? 'المشاريع' : 'Projects',
      value: stats.projects,
      color: 'from-rose-500 to-pink-500',
      link: 'projects'
    }
  ];

  const alertItems = [
    stats.pendingOrders > 0 && {
      icon: Clock,
      label: isRTL ? `${stats.pendingOrders} طلب في الانتظار` : `${stats.pendingOrders} pending orders`,
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      link: 'orders'
    },
    stats.openTickets > 0 && {
      icon: AlertCircle,
      label: isRTL ? `${stats.openTickets} تذكرة مفتوحة` : `${stats.openTickets} open tickets`,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      link: 'tickets'
    },
    stats.unreadMessages > 0 && {
      icon: MessageSquare,
      label: isRTL ? `${stats.unreadMessages} رسالة غير مقروءة` : `${stats.unreadMessages} unread messages`,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      link: 'messages'
    }
  ].filter(Boolean) as any[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isRTL ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL ? 'مرحباً بك في لوحة إدارة المحتوى' : 'Welcome to your content management system'}
        </p>
      </div>

      {alertItems.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alertItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onTabChange?.(item.link)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition hover:opacity-80 ${item.color}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={() => onTabChange?.(stat.link)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer group text-left w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, label: isRTL ? 'المنتجات' : 'Products', value: stats.products, link: 'products', color: 'text-blue-600' },
          { icon: BookOpen, label: isRTL ? 'مقالات المدونة' : 'Blog Posts', value: `${stats.publishedPosts}/${stats.blogPosts}`, link: 'blog', color: 'text-cyan-600' },
          { icon: Ticket, label: isRTL ? 'تذاكر الدعم' : 'Support Tickets', value: stats.supportTickets, link: 'tickets', color: 'text-red-500' },
          { icon: Star, label: isRTL ? 'آراء العملاء' : 'Testimonials', value: stats.testimonials, link: 'testimonials', color: 'text-amber-500' },
          { icon: Users, label: isRTL ? 'الفريق' : 'Team', value: stats.teamMembers, link: 'team', color: 'text-green-600' },
          { icon: MessageSquare, label: isRTL ? 'الرسائل' : 'Messages', value: stats.messages, link: 'messages', color: 'text-sky-500' },
          { icon: CheckCircle2, label: isRTL ? 'مشاريع مكتملة' : 'Completed Projects', value: stats.completedProjects, link: 'projects', color: 'text-emerald-600' },
          { icon: Activity, label: isRTL ? 'المشاريع النشطة' : 'Active Projects', value: stats.activeProjects, link: 'projects', color: 'text-orange-500' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onTabChange?.(item.link)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-left flex items-center gap-4 group"
            >
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            {isRTL ? 'حالة الطلبات' : 'Orders Status'}
          </h2>
          <div className="space-y-3">
            {[
              { label: isRTL ? 'في الانتظار' : 'Pending', value: stats.pendingOrders, total: stats.orders, color: 'from-yellow-500 to-orange-500' },
              { label: isRTL ? 'مكتمل' : 'Completed', value: stats.orders - stats.pendingOrders, total: stats.orders, color: 'from-green-500 to-emerald-500' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value} / {item.total}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-orange-500" />
            {isRTL ? 'حالة المشاريع' : 'Projects Status'}
          </h2>
          <div className="space-y-3">
            {[
              { label: isRTL ? 'قيد التنفيذ' : 'In Progress', value: stats.activeProjects, total: stats.projects, color: 'from-blue-500 to-cyan-500' },
              { label: isRTL ? 'مكتملة' : 'Completed', value: stats.completedProjects, total: stats.projects, color: 'from-green-500 to-emerald-500' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value} / {item.total}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: isRTL ? 'إضافة منتج' : 'Add Product', link: 'products', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800', iconColor: 'text-blue-600 dark:text-blue-400' },
            { icon: UserCheck, label: isRTL ? 'إضافة عميل' : 'Add Client', link: 'clients', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800', iconColor: 'text-green-600 dark:text-green-400' },
            { icon: FolderOpen, label: isRTL ? 'إضافة مشروع' : 'Add Project', link: 'projects', color: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800', iconColor: 'text-orange-600 dark:text-orange-400' },
            { icon: BookOpen, label: isRTL ? 'كتابة مقال' : 'Write Article', link: 'blog', color: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800', iconColor: 'text-sky-600 dark:text-sky-400' }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => onTabChange?.(action.link, true)}
                className={`bg-gradient-to-br ${action.color} border-2 rounded-xl p-4 hover:shadow-lg transition text-center group`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${action.iconColor} group-hover:scale-110 transition-transform`} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;
