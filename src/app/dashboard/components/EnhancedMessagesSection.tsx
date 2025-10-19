import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../../../hooks/useAuth';
import { getMessages, sendMessage, getUserProfile, updateApplicationStatus, sendPayment } from '../../../lib/supabase';
import { useDarkMode } from '../page';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  task_id?: string;
  application_id?: string;
  content: string;
  message_type: string;
  read: boolean;
  delivered: boolean;
  payment_amount?: string;
  payment_status?: string;
  metadata?: any;
  created_at: string;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name?: string;
  other_user_username?: string;
  other_user_avatar?: string;
  messages: Message[];
  last_message: Message | null;
  unread_count: number;
}

interface MessagesProps {
  onBack?: () => void;
}

export default function EnhancedMessagesSection({ onBack }: MessagesProps) {
  const { user, profile } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced emojis - modern and mixed
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
    '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️',
    '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
    '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐',
    '🖖', '👋', '🤝', '💪', '🦾', '🙏', '✍️', '💅',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬',
    '👁️‍🗨️', '🗨️', '🗯️', '💭', '🔥', '✨', '⭐', '🌟',
    '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'
  ];

  // Custom stickers
  const stickers = [
    { id: 1, emoji: '🎯', label: 'Target' },
    { id: 2, emoji: '🚀', label: 'Rocket' },
    { id: 3, emoji: '💰', label: 'Money' },
    { id: 4, emoji: '💎', label: 'Diamond' },
    { id: 5, emoji: '⚡', label: 'Lightning' },
    { id: 6, emoji: '🔥', label: 'Fire' },
    { id: 7, emoji: '✨', label: 'Sparkle' },
    { id: 8, emoji: '🎨', label: 'Art' },
    { id: 9, emoji: '🎭', label: 'Theater' },
    { id: 10, emoji: '🎪', label: 'Circus' },
    { id: 11, emoji: '🎬', label: 'Movie' },
    { id: 12, emoji: '🎮', label: 'Game' },
    { id: 13, emoji: '🎲', label: 'Dice' },
    { id: 14, emoji: '🎯', label: 'Dart' },
    { id: 15, emoji: '🎼', label: 'Music' },
    { id: 16, emoji: '🎹', label: 'Piano' },
    { id: 17, emoji: '🎺', label: 'Trumpet' },
    { id: 18, emoji: '🎸', label: 'Guitar' },
    { id: 19, emoji: '🥁', label: 'Drum' },
    { id: 20, emoji: '🎤', label: 'Mic' },
    { id: 21, emoji: '🎧', label: 'Headphone' },
    { id: 22, emoji: '📱', label: 'Phone' },
    { id: 23, emoji: '💻', label: 'Laptop' },
    { id: 24, emoji: '⌨️', label: 'Keyboard' },
    { id: 25, emoji: '🖱️', label: 'Mouse' },
    { id: 26, emoji: '🖨️', label: 'Printer' },
    { id: 27, emoji: '⚙️', label: 'Gear' },
    { id: 28, emoji: '🔧', label: 'Wrench' },
    { id: 29, emoji: '🔨', label: 'Hammer' },
    { id: 30, emoji: '🛠️', label: 'Tools' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(messagesRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, messagesRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadConversations, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await getMessages(user.id);
      if (!error && data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNewMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      const selectedConv = conversations.find(c => c.id === selectedConversation);
      if (!selectedConv) return;

      const { error } = await sendMessage({
        sender_id: user.id,
        recipient_id: selectedConv.other_user_id,
        content: newMessage.trim(),
        message_type: 'text'
      });

      if (!error) {
        setNewMessage('');
        await loadConversations();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await updateApplicationStatus(applicationId, action);
      if (!error) {
        alert(`Application ${action} successfully!`);
        await loadConversations();
      } else {
        alert('Failed to update application. Please try again.');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application. Please try again.');
    }
  };

  const handleSendPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedConv = conversations.find(c => c.id === selectedConversation);
    if (!selectedConv) return;

    try {
      const { data, error } = await sendPayment({
        recipient_id: selectedConv.other_user_id,
        amount: parseFloat(paymentAmount),
        description: paymentDescription || 'Task payment',
      });

      if (!error && data) {
        alert(`Payment of ₹${paymentAmount} sent successfully! Commission: ₹${data.commission.toFixed(2)}`);
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentDescription('');
        await loadConversations();
      } else {
        alert(error?.message || 'Failed to send payment. Please try again.');
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      alert('Failed to send payment. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addSticker = (sticker: any) => {
    setNewMessage(prev => prev + sticker.emoji);
    setShowStickerPicker(false);
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'application') {
      try {
        const appData = JSON.parse(message.content);
        const appStatus = appData.status || 'pending';
        
        return (
          <div className={`p-4 rounded-xl border ${ 
            isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                {appData.freelancer_avatar ? (
                  <img src={appData.freelancer_avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">{appData.freelancer_name?.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  New Application
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {appData.task_title}
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Applicant:</strong> {appData.freelancer_name}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Proposed Budget:</strong> ₹{appData.proposed_budget}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Timeline:</strong> {appData.estimated_duration}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <strong>Cover Letter:</strong> {appData.cover_letter}
              </p>
            </div>
            {message.sender_id !== user?.id && appStatus === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApplicationAction(appData.application_id, 'accepted')}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors cursor-pointer"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => handleApplicationAction(appData.application_id, 'rejected')}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                >
                  ✗ Reject
                </button>
              </div>
            )}
            {appStatus === 'accepted' && (
              <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
                ✓ Application Accepted
              </div>
            )}
            {appStatus === 'rejected' && (
              <div className="mt-3 p-2 bg-red-100 text-red-800 rounded-lg text-center font-semibold">
                ✗ Application Rejected
              </div>
            )}
          </div>
        );
      } catch {
        return <p className="text-sm">{message.content}</p>;
      }
    } else if (message.message_type === 'payment') {
      try {
        const paymentData = JSON.parse(message.content);
        return (
          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
          }`}>
            <p className="text-lg font-bold text-green-600 mb-2">💰 Payment Received</p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Amount: ₹{paymentData.amount}
            </p>
            {paymentData.commission > 0 && (
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Commission: ₹{paymentData.commission.toFixed(2)}
              </p>
            )}
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Ref: {paymentData.reference}
            </p>
          </div>
        );
      } catch {
        return <p className="text-sm">{message.content}</p>;
      }
    }
    
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

  return (
    <div ref={messagesRef} className={`fixed inset-0 z-50 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="h-full flex">
        {/* Conversations Sidebar */}
        <div className={`w-80 border-r flex flex-col ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h1>
              {onBack && (
                <button
                  onClick={onBack}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
              )}
            </div>
            <div className="relative">
              <i className={`ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-400'
              }`}></i>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedConversation === conversation.id
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                          {conversation.other_user_avatar ? (
                            <img src={conversation.other_user_avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold">
                              {conversation.other_user_name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold truncate ${
                            selectedConversation === conversation.id ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conversation.other_user_name || 'Unknown User'}
                          </h4>
                          {conversation.last_message && (
                            <span className={`text-xs ${
                              selectedConversation === conversation.id ? 'text-indigo-100' : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              {formatTime(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${
                          selectedConversation === conversation.id ? 'text-indigo-100' : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          @{conversation.other_user_username || 'unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <i className={`ri-message-3-line text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}></i>
                <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No conversations yet</h4>
                <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Start working on tasks to begin conversations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      {selectedConversationData.other_user_avatar ? (
                        <img src={selectedConversationData.other_user_avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">
                          {selectedConversationData.other_user_name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedConversationData.other_user_name || 'Unknown User'}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        @{selectedConversationData.other_user_username || 'unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
                {selectedConversationData.messages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => {
                  const isFromUser = message.sender_id === user?.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        isFromUser
                          ? 'bg-indigo-600 text-white'
                          : isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        {renderMessageContent(message)}
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${isFromUser ? 'text-indigo-100' : isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {formatTime(message.created_at)}
                          </p>
                          {isFromUser && (
                            <div className="flex items-center space-x-1">
                              <i className={`ri-check-line text-xs ${message.delivered ? 'text-indigo-200' : 'text-indigo-300'}`}></i>
                              {message.read && <i className="ri-check-line text-xs text-indigo-200"></i>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`p-6 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendNewMessage()}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className={`w-full px-4 py-3 pr-28 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      {/* Emoji Picker */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowStickerPicker(false);
                          }}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <i className="ri-emotion-line"></i>
                        </button>
                        {showEmojiPicker && (
                          <div className={`absolute bottom-12 right-0 border rounded-xl p-3 shadow-lg z-10 max-h-64 overflow-y-auto ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                          }`} style={{ width: '300px' }}>
                            <div className="grid grid-cols-8 gap-2">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => addEmoji(emoji)}
                                  className={`p-2 rounded-lg transition-colors cursor-pointer text-xl ${
                                    isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sticker Picker */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowStickerPicker(!showStickerPicker);
                            setShowEmojiPicker(false);
                          }}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <i className="ri-sticker-line"></i>
                        </button>
                        {showStickerPicker && (
                          <div className={`absolute bottom-12 right-0 border rounded-xl p-3 shadow-lg z-10 max-h-64 overflow-y-auto ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                          }`} style={{ width: '250px' }}>
                            <div className="grid grid-cols-5 gap-2">
                              {stickers.map((sticker) => (
                                <button
                                  key={sticker.id}
                                  onClick={() => addSticker(sticker)}
                                  className={`p-3 rounded-lg transition-colors cursor-pointer text-2xl ${
                                    isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                                  }`}
                                  title={sticker.label}
                                >
                                  {sticker.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Button */}
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                        title="Send Payment"
                      >
                        <i className="ri-money-rupee-circle-line"></i>
                      </button>

                      {/* Send Button */}
                      <button
                        onClick={sendNewMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {sendingMessage ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <i className="ri-send-plane-line"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <div className="text-center">
                <i className={`ri-chat-3-line text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}></i>
                <h4 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a conversation</h4>
                <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedConversationData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Send Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`cursor-pointer p-2 rounded-full transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Recipient
                </label>
                <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConversationData.other_user_name}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  placeholder="Enter amount"
                  min="1"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Note: 1% platform commission will be added
                </p>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Description (Optional)
                </label>
                <textarea
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  placeholder="Add a note (optional)"
                />
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Amount:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{paymentAmount || '0'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Commission (1%):</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    ₹{paymentAmount ? ((parseFloat(paymentAmount) * 1) / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-600">
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Total:</span>
                  <span className="text-green-600">
                    ₹{paymentAmount ? (parseFloat(paymentAmount) + (parseFloat(paymentAmount) * 1) / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Send Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
