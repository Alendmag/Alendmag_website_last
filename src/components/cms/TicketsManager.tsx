import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Search, Send, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle, X, User } from 'lucide-react';
import { supportTickets as supportTicketsApi, ticketReplies as ticketRepliesApi, teamMembers as teamMembersApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface SupportTicket {
  id: string;
  ticket_number: string;
  client_id: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_type: string;
  user_name: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface TeamMember {
  id: string;
  name_ar: string;
  name_en: string;
}

const TicketsManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const params: Record<string, any> = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const result = await supportTicketsApi.list(params);
      const data = (result as any)?.data || result;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(isRTL ? 'فشل تحميل التذاكر' : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const data = await teamMembersApi.list();
      if (data) setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const data = await ticketRepliesApi.list(ticketId);
      if (data) setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await supportTicketsApi.update(ticketId, { status });
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(isRTL ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const assignTicket = async (ticketId: string, teamMemberId: string) => {
    try {
      await supportTicketsApi.update(ticketId, { assigned_to: teamMemberId });
      toast.success(isRTL ? 'تم تعيين التذكرة' : 'Ticket assigned');
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error(isRTL ? 'فشل تعيين التذكرة' : 'Failed to assign ticket');
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      await ticketRepliesApi.create({
        ticket_id: selectedTicket.id,
        user_type: 'admin',
        user_name: isRTL ? 'فريق الدعم' : 'Support Team',
        message: replyMessage,
        is_internal: false
      });

      await supportTicketsApi.update(selectedTicket.id, { status: 'in-progress' });

      toast.success(isRTL ? 'تم إرسال الرد' : 'Reply sent');
      setReplyMessage('');
      fetchReplies(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(isRTL ? 'فشل إرسال الرد' : 'Failed to send reply');
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
            {isRTL ? 'تذاكر الدعم الفني' : 'Support Tickets'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? `${tickets.filter(t => t.status === 'open').length} تذكرة مفتوحة` : `${tickets.filter(t => t.status === 'open').length} open tickets`}
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
            placeholder={isRTL ? 'بحث في التذاكر...' : 'Search tickets...'}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl font-medium transition text-sm ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? (isRTL ? 'الكل' : 'All') :
               f === 'open' ? (isRTL ? 'مفتوحة' : 'Open') :
               f === 'in-progress' ? (isRTL ? 'قيد المعالجة' : 'In Progress') :
               f === 'resolved' ? (isRTL ? 'تم الحل' : 'Resolved') :
               (isRTL ? 'مغلقة' : 'Closed')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{ticket.ticket_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'open' ? (isRTL ? 'مفتوحة' : 'Open') :
                       ticket.status === 'in-progress' ? (isRTL ? 'قيد المعالجة' : 'In Progress') :
                       ticket.status === 'resolved' ? (isRTL ? 'تم الحل' : 'Resolved') :
                       (isRTL ? 'مغلقة' : 'Closed')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority === 'urgent' ? (isRTL ? 'عاجلة' : 'Urgent') :
                       ticket.priority === 'high' ? (isRTL ? 'عالية' : 'High') :
                       ticket.priority === 'medium' ? (isRTL ? 'متوسطة' : 'Medium') :
                       (isRTL ? 'منخفضة' : 'Low')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Ticket className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد تذاكر' : 'No tickets'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{selectedTicket.ticket_number}</span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedTicket.name} - {selectedTicket.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="open">{isRTL ? 'مفتوحة' : 'Open'}</option>
                    <option value="in-progress">{isRTL ? 'قيد المعالجة' : 'In Progress'}</option>
                    <option value="resolved">{isRTL ? 'تم الحل' : 'Resolved'}</option>
                    <option value="closed">{isRTL ? 'مغلقة' : 'Closed'}</option>
                  </select>
                  <select
                    value={selectedTicket.assigned_to || ''}
                    onChange={(e) => assignTicket(selectedTicket.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">{isRTL ? 'غير معين' : 'Unassigned'}</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {isRTL ? member.name_ar : member.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto max-h-[300px]">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`mb-4 ${reply.user_type === 'admin' ? 'ml-8' : 'mr-8'}`}
                  >
                    <div className={`rounded-xl p-4 ${
                      reply.user_type === 'admin'
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-gray-50 dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{reply.user_name}</span>
                        <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={isRTL ? 'اكتب ردك...' : 'Type your reply...'}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <Ticket className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'اختر تذكرة لعرضها' : 'Select a ticket to view'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsManager;
