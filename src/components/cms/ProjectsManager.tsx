import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CreditCard as Edit, Trash2, Save, X, FolderOpen, Calendar, TrendingUp, ListTodo } from 'lucide-react';
import { projects as projectsApi, clients as clientsApi } from '../../lib/api';
import type { Project, Client } from '../../lib/supabase';
import ProjectTasksManager from './ProjectTasksManager';
import toast from 'react-hot-toast';

interface ProjectsManagerProps {
  openFormOnMount?: boolean;
}

const ProjectsManager: React.FC<ProjectsManagerProps> = ({ openFormOnMount }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(openFormOnMount || false);
  const [filterClient, setFilterClient] = useState<string>('all');

  const emptyProject: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'clients'> = {
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    client_id: '',
    status: 'pending',
    progress: 0,
    start_date: '',
    due_date: '',
    image_url: '',
    technologies: []
  };

  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [showTasksFor, setShowTasksFor] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  useEffect(() => {
    if (openFormOnMount) {
      setShowForm(true);
    }
  }, [openFormOnMount]);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.list();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(isRTL ? 'فشل تحميل المشاريع' : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        client_id: formData.client_id || null
      };

      if (editingProject) {
        await projectsApi.update(editingProject.id, projectData);
        toast.success(isRTL ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully');
      } else {
        await projectsApi.create(projectData);
        toast.success(isRTL ? 'تم إضافة المشروع بنجاح' : 'Project added successfully');
      }

      setShowForm(false);
      setEditingProject(null);
      setFormData(emptyProject);
      setTechInput('');
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(isRTL ? 'فشل حفظ المشروع' : 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) return;

    try {
      await projectsApi.remove(id);
      toast.success(isRTL ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(isRTL ? 'فشل حذف المشروع' : 'Failed to delete project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title_ar: project.title_ar,
      title_en: project.title_en,
      description_ar: project.description_ar || '',
      description_en: project.description_en || '',
      client_id: project.client_id || '',
      status: project.status,
      progress: project.progress,
      start_date: project.start_date || '',
      due_date: project.due_date || '',
      image_url: project.image_url || '',
      technologies: project.technologies || []
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData(emptyProject);
    setTechInput('');
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return isRTL ? 'مكتمل' : 'Completed';
      case 'in-progress':
        return isRTL ? 'قيد التنفيذ' : 'In Progress';
      case 'pending':
        return isRTL ? 'في الانتظار' : 'Pending';
      default:
        return status;
    }
  };

  const filteredProjects = filterClient === 'all'
    ? projects
    : projects.filter(project => project.client_id === filterClient);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'إدارة المشاريع' : 'Projects Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة ومتابعة المشاريع حسب العميل' : 'Manage and track projects by client'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة مشروع' : 'Add Project'}
          </button>
        )}
      </div>

      {/* Stats & Filter */}
      <div className="grid md:grid-cols-4 gap-6">
        <button
          onClick={() => setFilterClient('all')}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
            filterClient === 'all' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{projects.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'جميع المشاريع' : 'All Projects'}</div>
        </button>

        {['pending', 'in-progress', 'completed'].map((status) => (
          <div
            key={status}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
              status === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
              'bg-gradient-to-br from-yellow-500 to-orange-500'
            }`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {projects.filter(p => p.status === status).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{getStatusText(status)}</div>
          </div>
        ))}
      </div>

      {/* Client Filter */}
      {clients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {isRTL ? 'تصفية حسب العميل' : 'Filter by Client'}
          </label>
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">{isRTL ? 'جميع العملاء' : 'All Clients'}</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingProject ? (isRTL ? 'تعديل المشروع' : 'Edit Project') : (isRTL ? 'مشروع جديد' : 'New Project')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان بالعربية' : 'Title (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العنوان بالإنجليزية' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'العميل' : 'Client'}
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">{isRTL ? 'بدون عميل' : 'No Client'}</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الحالة' : 'Status'} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  required
                >
                  <option value="pending">{isRTL ? 'في الانتظار' : 'Pending'}</option>
                  <option value="in-progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
                  <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'نسبة الإنجاز' : 'Progress'} ({formData.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تاريخ البدء' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تاريخ التسليم' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'رابط صورة المشروع' : 'Project Image URL'}
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isRTL ? 'استخدم روابط من Pexels أو مواقع الصور المجانية' : 'Use links from Pexels or free stock photo sites'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الوصف بالعربية' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  rows={3}
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الوصف بالإنجليزية' : 'Description (English)'}
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'التقنيات المستخدمة' : 'Technologies'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder={isRTL ? 'مثال: React, Node.js' : 'e.g., React, Node.js'}
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {isRTL ? 'إضافة' : 'Add'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
              >
                <Save className="w-5 h-5" />
                {isRTL ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <X className="w-5 h-5" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition"
          >
            {project.image_url && (
              <img
                src={project.image_url}
                alt={isRTL ? project.title_ar : project.title_en}
                className="w-full h-48 object-cover"
              />
            )}
            {!project.image_url && (
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                <FolderOpen className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isRTL ? project.title_ar : project.title_en}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>

              {project.clients && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {isRTL ? 'العميل:' : 'Client:'} {project.clients.name}
                </p>
              )}

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {isRTL ? project.description_ar : project.description_en}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Dates */}
              {(project.start_date || project.due_date) && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  {project.start_date && (
                    <span>{new Date(project.start_date).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US')}</span>
                  )}
                  {project.start_date && project.due_date && <span>-</span>}
                  {project.due_date && (
                    <span>{new Date(project.due_date).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US')}</span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                  >
                    <Edit className="w-4 h-4" />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isRTL ? 'حذف' : 'Delete'}
                  </button>
                </div>
                <button
                  onClick={() => setShowTasksFor(project)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                >
                  <ListTodo className="w-4 h-4" />
                  {isRTL ? 'إدارة المهام' : 'Manage Tasks'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'لا توجد مشاريع. ابدأ بإضافة مشروع جديد!' : 'No projects yet. Start by adding a new project!'}
          </p>
        </div>
      )}

      {/* Project Tasks Manager Modal */}
      {showTasksFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRTL ? showTasksFor.title_ar : showTasksFor.title_en}
              </h2>
              <button
                onClick={() => setShowTasksFor(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <ProjectTasksManager
                projectId={showTasksFor.id}
                projectTitle={isRTL ? showTasksFor.title_ar : showTasksFor.title_en}
                isRTL={isRTL}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
