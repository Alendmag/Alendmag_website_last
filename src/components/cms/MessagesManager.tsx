import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Eye, Archive, Trash2, Clock, CheckCircle, X, Reply, Search } from 'lucide-react';
import { contactMessages as contactMessagesApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  replied_at: string | null;
  admin_notes: string | null;
  created_at: string;
}

const MessagesManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      const params: Record<string, any> = {};
      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter === 'archived') {
        params.is_archived = true;
      } else {
        params.is_archived = false;
      }
      const result = await contactMessagesApi.list(params);
      const data = (result as any)?.data || result;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(isRTL ? 'فشل تحميل الرسائل' : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await contactMessagesApi.update(id, { is_read: true });
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const archiveMessage = async (id: string) => {
    try {
      await contactMessagesApi.update(id, { is_archived: true });
      toast.success(isRTL ? 'تم أرشفة الرسالة' : 'Message archived');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error(isRTL ? 'فشل أرشفة الرسالة' : 'Failed to archive');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) return;

    try {
      await contactMessagesApi.remove(id);
      toast.success(isRTL ? 'تم حذف الرسالة' : 'Message deleted');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(isRTL ? 'فشل حذف الرسالة' : 'Failed to delete');
    }
  };

  const saveNotes = async () => {
    if (!selectedMessage) return;

    try {
      await contactMessagesApi.update(selectedMessage.id, { admin_notes: adminNotes });
      toast.success(isRTL ? 'تم حفظ الملاحظات' : 'Notes saved');
      fetchMessages();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error(isRTL ? 'فشل حفظ الملاحظات' : 'Failed to save notes');
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'رسائل التواصل' : 'Contact Messages'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? `${unreadCount} رسالة غير مقروءة` : `${unreadCount} unread messages`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث في الرسائل...' : 'Search messages...'}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? (isRTL ? 'الكل' : 'All') :
               f === 'unread' ? (isRTL ? 'غير مقروءة' : 'Unread') :
               (isRTL ? 'المؤرشفة' : 'Archived')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setAdminNotes(msg.admin_notes || '');
                    if (!msg.is_read) markAsRead(msg.id);
                  }}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${!msg.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      !msg.is_read ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold truncate ${!msg.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {msg.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!msg.is_read ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {msg.message}
                      </p>
                    </div>
                    {!msg.is_read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد رسائل' : 'No messages'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMessage.subject}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {isRTL ? 'من:' : 'From:'} {selectedMessage.name} ({selectedMessage.email})
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL ? 'الهاتف:' : 'Phone:'} {selectedMessage.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'ملاحظات الإدارة' : 'Admin Notes'}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder={isRTL ? 'أضف ملاحظاتك هنا...' : 'Add your notes here...'}
                  />
                  <button
                    onClick={saveNotes}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    {isRTL ? 'حفظ الملاحظات' : 'Save Notes'}
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <Reply className="w-4 h-4" />
                  {isRTL ? 'رد' : 'Reply'}
                </a>
                <button
                  onClick={() => archiveMessage(selectedMessage.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <Archive className="w-4 h-4" />
                  {isRTL ? 'أرشفة' : 'Archive'}
                </button>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'اختر رسالة لعرضها' : 'Select a message to view'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManager;
