
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getTasks, getTaskApplications } from '../../../lib/supabase';
import { useDarkMode } from '../page';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: string;
  priority: string;
  client_id: string;
  client_name: string;
  skills_required: string[];
  created_at: string;
}

interface Application {
  id: string;
  task_id: string;
  freelancer_id: string;
  freelancer_name: string;
  proposal: string;
  timeline: string;
  proposed_budget: number;
  status: string;
  created_at: string;
  task: Task;
}

export default function MyTasksSection() {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applied');

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await getTaskApplications(user.id);
      if (!error && data) {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>My Tasks</h2>
          <p className={`mt-2 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>Track your task applications and progress</p>
        </div>
        
        <div className={`flex rounded-xl p-1 ${
          isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setActiveTab('applied')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'applied'
                ? 'bg-indigo-600 text-white shadow-lg'
                : isDarkMode 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Applied Tasks
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-lg'
                : isDarkMode 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Tasks
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Loading your tasks...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <i className={`ri-briefcase-line text-6xl mb-4 ${
            isDarkMode ? 'text-slate-600' : 'text-gray-300'
          }`}></i>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>No applications yet</h3>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Start applying to tasks in the marketplace to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className={`rounded-2xl p-6 shadow-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{application.task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.task.priority)}`}>
                      {application.task.priority?.toUpperCase()}
                    </span>
                  </div>
                  <p className={`mb-3 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>{application.task.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {application.task.skills_required.map((skill, index) => (
                      <span key={index} className={`px-2 py-1 rounded-lg text-xs ${
                        isDarkMode 
                          ? 'bg-slate-700 text-slate-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ₹{application.task.budget.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>Client Budget</div>
                </div>
              </div>

              <div className={`border-t pt-4 ${
                isDarkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>Your Proposal</div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{application.proposed_budget.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>Timeline</div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{application.timeline}</div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>Deadline</div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDate(application.task.deadline)}</div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>Applied On</div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDate(application.created_at)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {application.task.client_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{application.task.client_name}</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>{application.task.category}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      <i className="ri-message-3-line mr-2"></i>
                      Message Client
                    </button>
                    {application.status === 'accepted' && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                        <i className="ri-play-line mr-2"></i>
                        Start Work
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Proposal Details */}
              <div className={`mt-4 p-4 rounded-xl ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
              }`}>
                <div className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>Your Proposal:</div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>{application.proposal}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}