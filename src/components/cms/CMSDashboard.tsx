import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  FolderOpen,
  Users,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    projectTasks: 0,
    completedProjects: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        products,
        orders,
        clients,
        projects,
        teamMembers,
        testimonials,
        faq,
        supportTickets,
        projectTasks
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('faq').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('project_tasks').select('*', { count: 'exact', head: true })
      ]);

      const [pendingOrders, activeProjects, completedProjects] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        clients: clients.count || 0,
        projects: projects.count || 0,
        teamMembers: teamMembers.count || 0,
        pendingOrders: pendingOrders.count || 0,
        activeProjects: activeProjects.count || 0,
        testimonials: testimonials.count || 0,
        faq: faq.count || 0,
        supportTickets: supportTickets.count || 0,
        projectTasks: projectTasks.count || 0,
        completedProjects: completedProjects.count || 0,
        revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainStats = [
    {
      icon: Package,
      label: isRTL ? 'المنتجات' : 'Products',
      value: stats.products,
      color: 'from-blue-500 to-cyan-500',
      link: 'products'
    },
    {
      icon: ShoppingCart,
      label: isRTL ? 'الطلبات' : 'Orders',
      value: stats.orders,
      color: 'from-green-500 to-emerald-500',
      link: 'orders'
    },
    {
      icon: UserCheck,
      label: isRTL ? 'العملاء' : 'Clients',
      value: stats.clients,
      color: 'from-purple-500 to-pink-500',
      link: 'clients'
    },
    {
      icon: FolderOpen,
      label: isRTL ? 'المشاريع' : 'Projects',
      value: stats.projects,
      color: 'from-orange-500 to-red-500',
      link: 'projects'
    }
  ];

  const quickStats = [
    {
      label: isRTL ? 'طلبات في الانتظار' : 'Pending Orders',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      label: isRTL ? 'مشاريع نشطة' : 'Active Projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: isRTL ? 'أعضاء الفريق' : 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isRTL ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL ? 'مرحباً بك في لوحة إدارة المحتوى' : 'Welcome to your content management system'}
        </p>
      </div>

      {/* Main Stats Grid */}
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickStats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {isRTL ? 'نظرة عامة على النظام' : 'System Overview'}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Products Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {isRTL ? 'المنتجات' : 'Products'}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي المنتجات' : 'Total Products'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.products}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Orders Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                {isRTL ? 'الطلبات' : 'Orders'}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'في الانتظار' : 'Pending'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.pendingOrders} / {stats.orders}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                    style={{ width: `${stats.orders > 0 ? (stats.pendingOrders / stats.orders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Clients Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {isRTL ? 'العملاء' : 'Clients'}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.clients}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Projects Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {isRTL ? 'المشاريع' : 'Projects'}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.activeProjects} / {stats.projects}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                    style={{ width: `${stats.projects > 0 ? (stats.activeProjects / stats.projects) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onTabChange?.('products', true)}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 hover:shadow-lg transition text-center group"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
            </p>
          </button>
          <button
            onClick={() => onTabChange?.('clients', true)}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 hover:shadow-lg transition text-center group"
          >
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRTL ? 'إضافة عميل جديد' : 'Add New Client'}
            </p>
          </button>
          <button
            onClick={() => onTabChange?.('projects', true)}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 hover:shadow-lg transition text-center group"
          >
            <FolderOpen className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRTL ? 'إضافة مشروع جديد' : 'Add New Project'}
            </p>
          </button>
          <button
            onClick={() => onTabChange?.('team', true)}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 hover:shadow-lg transition text-center group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRTL ? 'إضافة عضو فريق' : 'Add Team Member'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;
