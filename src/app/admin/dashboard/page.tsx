'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { getTasks, getTaskApplications, getWalletTransactions, signOut, getAllUsers, getAllTransactions } from '@/lib/supabase';
import AdminSidebar from './components/AdminSidebar';
import UsersSection from './components/UsersSection';
import WalletSection from './components/WalletSection';
import SettingsSection from './components/SettingsSection';
import OverviewSection from './components/OverviewSection';

export default function AdminDashboard() {
  const { user, isAdmin: isAdminUser, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    recentUsers: [],
    recentTasks: [],
    recentTransactions: []
  });
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Check admin access
  useEffect(() => {
    if (!loading) {
      // Check for admin session
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession && !isAdminUser) {
        router.push('/auth');
        return;
      }
      
      if (adminSession) {
        const session = JSON.parse(adminSession);
        if (session.expires_at <= Date.now()) {
          localStorage.removeItem('admin_session');
          router.push('/auth');
          return;
        }
      }
    }
  }, [loading, isAdminUser, router]);

  // Load admin dashboard data
  useEffect(() => {
    const loadAdminData = async () => {
      // Check if user has admin access
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession && !isAdminUser) return;

      try {
        // Get all data from real database
        const [usersResult, tasksResult, transactionsResult] = await Promise.all([
          getAllUsers(),
          getTasks(),
          getAllTransactions()
        ]);

        const users = usersResult.data || [];
        const tasks = tasksResult.data || [];
        const transactions = transactionsResult.data || [];

        const totalUsers = users.length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
        const pendingTasks = tasks.filter((task: any) => task.status === 'pending').length;
        
        // Calculate total revenue from earnings/credit transactions
        const totalRevenue = transactions
          .filter((t: any) => t.type === 'earning' || t.type === 'credit')
          .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
        
        // Consider users active if they have recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = users.filter((user: any) => {
          const lastActivity = new Date(user.updated_at || user.created_at);
          return lastActivity > thirtyDaysAgo;
        }).length;

        setAdminData({
          totalUsers,
          totalTasks,
          totalRevenue,
          activeUsers,
          completedTasks,
          pendingTasks,
          recentUsers: users.slice(0, 10),
          recentTasks: tasks.slice(0, 10),
          recentTransactions: transactions.slice(0, 10)
        });
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadAdminData();
  }, [isAdminUser]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(dashboardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check admin access after loading
  const adminSession = localStorage.getItem('admin_session');
  if (!adminSession && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-red-700 mb-6">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersSection />;
      case 'wallet':
        return <WalletSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div ref={dashboardRef} className="flex">
        <AdminSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 min-h-screen">
          {/* Enhanced Header */}
          <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your Microwin platform</p>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Quick Stats */}
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{adminData.activeUsers}</div>
                    <div className="text-xs text-gray-500">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">₹{adminData.totalRevenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{adminData.totalTasks}</div>
                    <div className="text-xs text-gray-500">Total Tasks</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Administrator</p>
                    <p className="text-sm text-gray-500">admin@gmail.com</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Task Management Section with localStorage data
function TaskManagementSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Load all tasks regardless of status for admin panel
        const { data } = await getTasks({ status: '' });
        if (data) {
          setTasks(data);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task: any) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Task Management Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h2>
            <p className="text-gray-600">Monitor and manage all platform tasks</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i className="ri-add-line mr-2"></i>
              Create Task
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
              <i className="ri-download-line mr-2"></i>
              Export
            </button>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
              </div>
              <i className="ri-task-line text-3xl text-blue-600"></i>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{tasks.filter((t: any) => t.status === 'completed').length}</p>
              </div>
              <i className="ri-check-circle-line text-3xl text-green-600"></i>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{tasks.filter((t: any) => t.status === 'in_progress').length}</p>
              </div>
              <i className="ri-play-circle-line text-3xl text-orange-600"></i>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-purple-900">{tasks.filter((t: any) => t.status === 'pending').length}</p>
              </div>
              <i className="ri-time-line text-3xl text-purple-600"></i>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{tasks.filter((t: any) => t.priority === 'high').length}</p>
              </div>
              <i className="ri-alarm-warning-line text-3xl text-red-600"></i>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Task</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Priority</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Budget</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Created</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task: any) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.category}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">₹{task.budget}</td>
                  <td className="py-4 px-4 text-gray-700">{new Date(task.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-task-line text-6xl text-gray-300 mb-4"></i>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h4>
            <p className="text-gray-600">No tasks match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Analytics Section with localStorage data
function AnalyticsSection({ adminData }: { adminData: any }) {
  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive platform insights and metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i className="ri-download-line mr-2"></i>
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <i className="ri-user-line text-2xl text-white"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{adminData.totalUsers}</div>
                <div className="text-sm text-blue-600">Real users</div>
              </div>
            </div>
            <h3 className="font-semibold text-blue-900">Total Users</h3>
            <p className="text-sm text-blue-600">Registered platform users</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-2xl text-white"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">₹{adminData.totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-green-600">Live data</div>
              </div>
            </div>
            <h3 className="font-semibold text-green-900">Total Revenue</h3>
            <p className="text-sm text-green-600">Platform earnings</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <i className="ri-task-line text-2xl text-white"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-900">{adminData.completedTasks}</div>
                <div className="text-sm text-purple-600">Real count</div>
              </div>
            </div>
            <h3 className="font-semibold text-purple-900">Tasks Completed</h3>
            <p className="text-sm text-purple-600">Successfully finished</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <i className="ri-user-check-line text-2xl text-white"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-900">{adminData.activeUsers}</div>
                <div className="text-sm text-orange-600">Last 30 days</div>
              </div>
            </div>
            <h3 className="font-semibold text-orange-900">Active Users</h3>
            <p className="text-sm text-orange-600">Recent activity</p>
          </div>
        </div>

        {/* Real Data Summary */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{adminData.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{adminData.pendingTasks}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {adminData.totalTasks > 0 ? ((adminData.completedTasks / adminData.totalTasks) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
