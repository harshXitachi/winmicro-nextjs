
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../../../hooks/useAuth';
import { getMessages, sendMessage, markMessageAsRead, getUserProfile } from '../../../lib/supabase';
import { useDarkMode } from '../page';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  task_id?: string;
  content: string;
  message_type: string;
  read: boolean;
  delivered: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name?: string;
  other_user_username?: string;
  messages: Message[];
  last_message: Message | null;
  unread_count: number;
}

interface MessagesProps {
  onBack?: () => void;
}

export default function MessagesSection({ onBack }: MessagesProps) {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  
  const messagesRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '❤️', '💯', '🔥', '✨', '🎉', '💪', '🙏', '👏'];

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
        // Load user profiles for each conversation
        const conversationsWithProfiles = await Promise.all(
          data.map(async (conv: Conversation) => {
            const { data: profileData } = await getUserProfile(conv.other_user_id);
            return {
              ...conv,
              other_user_name: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Unknown User',
              other_user_username: profileData?.username || 'unknown'
            };
          })
        );
        setConversations(conversationsWithProfiles);
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
        loadConversations();
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

  const showUserProfile = async (userId: string) => {
    try {
      const { data } = await getUserProfile(userId);
      setSelectedUserProfile(data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
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
      {/* Full Screen Messages Interface */}
      <div className="h-full flex">
        {/* Conversations Sidebar */}
        <div className={`w-80 border-r flex flex-col ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Messages</h1>
              {onBack && (
                <button
                  onClick={onBack}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
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
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div ref={conversationsRef} className="flex-1 overflow-y-auto">
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
                    className={`conversation-item p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedConversation === conversation.id
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode 
                          ? 'hover:bg-slate-700' 
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {conversation.other_user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
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
                            selectedConversation === conversation.id 
                              ? 'text-white' 
                              : isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conversation.other_user_name || 'Unknown User'}
                          </h4>
                          {conversation.last_message && (
                            <span className={`text-xs ${
                              selectedConversation === conversation.id 
                                ? 'text-indigo-100' 
                                : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              {formatTime(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${
                          selectedConversation === conversation.id 
                            ? 'text-indigo-100' 
                            : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          @{conversation.other_user_username || 'unknown'}
                        </p>
                        {conversation.last_message && (
                          <p className={`text-sm truncate mt-1 ${
                            selectedConversation === conversation.id 
                              ? 'text-indigo-100' 
                              : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }`}>
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <i className={`ri-message-3-line text-6xl mb-4 ${
                  isDarkMode ? 'text-slate-600' : 'text-gray-300'
                }`}></i>
                <h4 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>No conversations yet</h4>
                <p className={`text-center ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Start working on tasks to begin conversations with clients and freelancers
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
              <div className={`p-6 border-b ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedConversationData.other_user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedConversationData.other_user_name || 'Unknown User'}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        @{selectedConversationData.other_user_username || 'unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => showUserProfile(selectedConversationData.other_user_id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isDarkMode 
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      title="View Profile"
                    >
                      <i className="ri-information-line text-xl"></i>
                    </button>
                    <button className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}>
                      <i className="ri-phone-line text-xl"></i>
                    </button>
                    <button className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}>
                      <i className="ri-video-line text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
              }`}>
                {selectedConversationData.messages.map((message) => {
                  const isFromUser = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                        isFromUser
                          ? 'bg-indigo-600 text-white'
                          : isDarkMode 
                            ? 'bg-slate-800 text-white border border-slate-700' 
                            : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            isFromUser 
                              ? 'text-indigo-100' 
                              : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                          {isFromUser && (
                            <div className="flex items-center space-x-1">
                              <i className={`ri-check-line text-xs ${
                                message.delivered ? 'text-indigo-200' : 'text-indigo-300'
                              }`}></i>
                              {message.read && (
                                <i className="ri-check-line text-xs text-indigo-200"></i>
                              )}
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
              <div className={`p-6 border-t ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendNewMessage()}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className={`w-full px-4 py-3 pr-20 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isDarkMode 
                              ? 'text-slate-400 hover:text-white' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <i className="ri-emotion-line"></i>
                        </button>
                        {showEmojiPicker && (
                          <div className={`absolute bottom-12 right-0 border rounded-xl p-3 shadow-lg z-10 ${
                            isDarkMode 
                              ? 'bg-slate-800 border-slate-700' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="grid grid-cols-5 gap-2">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => addEmoji(emoji)}
                                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
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
            <div className={`flex-1 flex items-center justify-center ${
              isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
            }`}>
              <div className="text-center">
                <i className={`ri-chat-3-line text-6xl mb-4 ${
                  isDarkMode ? 'text-slate-600' : 'text-gray-300'
                }`}></i>
                <h4 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Select a conversation</h4>
                <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-md ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>User Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className={`cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">
                  {`${selectedUserProfile.first_name} ${selectedUserProfile.last_name}`.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h4 className={`text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedUserProfile.first_name} {selectedUserProfile.last_name}
              </h4>
              <p className={`mb-4 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>@{selectedUserProfile.username}</p>
              
              {selectedUserProfile.bio && (
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>{selectedUserProfile.bio}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-indigo-600">{selectedUserProfile.completed_tasks || 0}</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{selectedUserProfile.rating || 0}★</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}