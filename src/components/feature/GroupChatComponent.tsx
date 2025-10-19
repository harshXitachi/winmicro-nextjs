'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'payment_notification';
  metadata?: any;
  is_pinned: boolean;
  created_at: string;
  sender_name: string;
}

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  total_earned: string;
}

interface GroupChatComponentProps {
  campaignId: string;
  isAdmin: boolean;
  currentUserId: string;
  members: Member[];
  onMemberUpdate?: () => void;
}

export default function GroupChatComponent({
  campaignId,
  isAdmin,
  currentUserId,
  members,
  onMemberUpdate,
}: GroupChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusNote, setBonusNote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [campaignId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBonus = async () => {
    if (!selectedWorker || !bonusAmount || parseFloat(bonusAmount) <= 0) {
      alert('Please select a worker and enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/bonus-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: selectedWorker,
          amount: parseFloat(bonusAmount),
          note: bonusNote,
        }),
      });

      if (response.ok) {
        alert('Bonus payment sent successfully!');
        setShowBonusModal(false);
        setSelectedWorker('');
        setBonusAmount('');
        setBonusNote('');
        fetchMessages();
        onMemberUpdate?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send bonus payment');
      }
    } catch (error) {
      console.error('Error sending bonus:', error);
      alert('Failed to send bonus payment');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getMessageStyle = (message: Message) => {
    if (message.message_type === 'system') {
      return 'bg-blue-50 border-l-4 border-blue-500 text-blue-800 italic';
    }
    if (message.message_type === 'payment_notification') {
      return 'bg-green-50 border-l-4 border-green-500 text-green-800 font-medium';
    }
    return 'bg-white border-l-4 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="ri-message-3-line text-2xl text-indigo-600"></i>
          <div>
            <h3 className="font-semibold text-gray-900">Group Chat</h3>
            <p className="text-xs text-gray-500">{members.length} members</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowBonusModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <i className="ri-money-dollar-circle-line"></i>
            <span>Pay Worker</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-chat-3-line text-5xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${getMessageStyle(message)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {message.sender_name}
                  </span>
                  {message.sender_id === currentUserId && (
                    <span className="text-xs text-gray-500">(You)</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {message.content}
              </p>
              {message.is_pinned && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-indigo-600">
                  <i className="ri-pushpin-line"></i>
                  <span>Pinned</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bonus Payment Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Send Bonus Payment</h3>
                <button
                  onClick={() => setShowBonusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Worker *
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a worker...</option>
                  {members
                    .filter(m => m.role === 'worker' && m.user_id !== currentUserId)
                    .map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user_name} (Earned: ₹{member.total_earned})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Amount *
                </label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  placeholder="Great work on..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <i className="ri-information-line mr-2"></i>
                  The bonus will be instantly added to the worker's wallet and announced in the chat.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowBonusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBonus}
                disabled={!selectedWorker || !bonusAmount || parseFloat(bonusAmount) <= 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Bonus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
