import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CreditCard as Edit, Trash2, Save, X, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, User } from 'lucide-react';
import { projectTasks as projectTasksApi, teamMembers as teamMembersApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  name_ar: string;
  name_en: string;
}

interface ProjectTasksManagerProps {
  projectId: string;
  projectTitle: string;
  isRTL: boolean;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({ projectId, projectTitle, isRTL }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const emptyTask = {
    title: '',
    description: '',
    status: 'pending' as const,
    assigned_to: null,
    priority: 'medium' as const,
    due_date: null
  };

  const [formData, setFormData] = useState(emptyTask);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const data = await projectTasksApi.list(projectId);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const data = await teamMembersApi.list();
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        project_id: projectId,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null
      };

      if (editingTask) {
        await projectTasksApi.update(editingTask.id, taskData);
        toast.success(isRTL ? 'تم تحديث المهمة بنجاح' : 'Task updated successfully');
      } else {
        await projectTasksApi.create(taskData);
        toast.success(isRTL ? 'تم إضافة المهمة بنجاح' : 'Task added successfully');
      }

      setShowForm(false);
      setEditingTask(null);
      setFormData(emptyTask);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(isRTL ? 'فشل حفظ المهمة' : 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) return;

    try {
      await projectTasksApi.remove(id);
      toast.success(isRTL ? 'تم حذف المهمة بنجاح' : 'Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(isRTL ? 'فشل حذف المهمة' : 'Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status as any,
      assigned_to: task.assigned_to,
      priority: task.priority as any,
      due_date: task.due_date
    });
    setShowForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isRTL ? 'قائمة المهام' : 'Task List'}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            {isRTL ? 'إضافة مهمة' : 'Add Task'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editingTask ? (isRTL ? 'تعديل المهمة' : 'Edit Task') : (isRTL ? 'مهمة جديدة' : 'New Task')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'عنوان المهمة' : 'Task Title'} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                rows={3}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="in-progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
                  <option value="completed">{isRTL ? 'مكتملة' : 'Completed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الأولوية' : 'Priority'}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                  <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                  <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تعيين إلى' : 'Assign To'}
                </label>
                <select
                  value={formData.assigned_to || ''}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value || null })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">{isRTL ? 'غير محدد' : 'Unassigned'}</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {isRTL ? member.name_ar : member.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
              >
                <Save className="w-5 h-5" />
                {isRTL ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                  setFormData(emptyTask);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <X className="w-5 h-5" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => {
          const assignedMember = teamMembers.find(m => m.id === task.assigned_to);
          return (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                  {isRTL ?
                    (task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة') :
                    task.priority
                  }
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
              )}

              <div className="space-y-2 mb-3">
                {assignedMember && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{isRTL ? assignedMember.name_ar : assignedMember.name_en}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(task.due_date).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'لا توجد مهام لهذا المشروع. ابدأ بإضافة مهمة جديدة!' : 'No tasks for this project. Start by adding a new task!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectTasksManager;
