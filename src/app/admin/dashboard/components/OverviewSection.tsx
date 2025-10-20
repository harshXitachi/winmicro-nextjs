'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { formatCurrency } from '@/lib/currency';

interface OverviewSectionProps {
  adminData?: any;
}

export default function OverviewSection({ adminData }: OverviewSectionProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState({
    totalUsers: adminData?.totalUsers || 0,
    activeTasks: 0,
    totalRevenue: adminData?.totalRevenue || 0,
    commissionRate: 2.0,
    newRegistrations: 0,
    activeUsers: adminData?.activeUsers || 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminData) {
      setStats({
        totalUsers: adminData.totalUsers || 0,
        activeTasks: adminData.totalTasks || 0,
        totalRevenue: adminData.totalRevenue || 0,
        commissionRate: 2.0,
        newRegistrations: 0,
        activeUsers: adminData.activeUsers || 0
      });
      setLoading(false);
    } else {
      loadAdminData();
    }
  }, [adminData]);

  const loadAdminData = async () => {
    try {
      const [usersRes, tasksRes, walletsRes, settingsRes, activityRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tasks'),
        fetch('/api/admin/wallet'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/activity-logs?limit=5')
      ]);

      if (usersRes.ok) {
        const { users } = await usersRes.json();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUsers = users.filter((u: any) => new Date(u.created_at) > thirtyDaysAgo);
        const activeUsers = users.filter((u: any) => !u.is_banned);
        
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          newRegistrations: newUsers.length,
          activeUsers: activeUsers.length
        }));
      }

      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        const activeTasks = tasks.filter((t: any) => 
          t.status === 'active' || t.status === 'in_progress'
        ).length;
        
        setStats(prev => ({ ...prev, activeTasks }));
      }

      if (walletsRes.ok) {
        const { wallets } = await walletsRes.json();
        const totalRevenue = wallets.reduce((sum: number, w: any) => 
          sum + parseFloat(w.total_commission_earned || 0), 0
        );
        
        setStats(prev => ({ ...prev, totalRevenue }));
      }

      if (settingsRes.ok) {
        const { settings } = await settingsRes.json();
        const commissionSetting = settings.find((s: any) => s.key === 'commission_percentage');
        if (commissionSetting) {
          setStats(prev => ({ ...prev, commissionRate: parseFloat(commissionSetting.value) }));
        }
      }

      if (activityRes.ok) {
        const { logs } = await activityRes.json();
        const mappedActivity = logs.map((log: any) => {
          let icon = 'ri-information-line';
          let color = 'gray';
          
          if (log.action.includes('register') || log.action.includes('signup')) {
            icon = 'ri-user-add-line';
            color = 'blue';
          } else if (log.action.includes('task') && log.action.includes('complete')) {
            icon = 'ri-check-line';
            color = 'green';
          } else if (log.action.includes('payment') || log.action.includes('withdraw')) {
            icon = 'ri-money-dollar-circle-line';
            color = 'purple';
          } else if (log.action.includes('ban') || log.action.includes('report')) {
            icon = 'ri-alert-line';
            color = 'red';
          } else if (log.action.includes('login') || log.action.includes('update')) {
            icon = 'ri-settings-line';
            color = 'orange';
          }
          
          const timeAgo = getTimeAgo(new Date(log.created_at));
          
          return {
            type: log.action,
            message: `${log.action}: ${log.details || 'No details'}`,
            time: timeAgo,
            icon,
            color
          };
        });
        
        setRecentActivity(mappedActivity);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card');
        gsap.fromTo(cards,
          { y: 60, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, delay: 0.2, ease: "back.out(1.7)" }
        );
      }

      if (chartsRef.current) {
        const elements = chartsRef.current.querySelectorAll('.chart-card');
        gsap.fromTo(elements,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, delay: 0.6, ease: "power3.out" }
        );
      }
    }, overviewRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={overviewRef}>
      {/* Stats Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-line text-2xl text-blue-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Users</h3>
          <p className="text-sm text-gray-600">{stats.newRegistrations} new this month</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-task-line text-2xl text-green-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.activeTasks.toLocaleString()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Active Tasks</h3>
          <p className="text-sm text-gray-600">Currently in progress</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-2xl text-purple-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {loading ? '...' : `$${stats.totalRevenue.toFixed(2)}`}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Revenue</h3>
          <p className="text-sm text-gray-600">Total commission earned</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <i className="ri-percent-line text-2xl text-orange-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {loading ? '...' : `${stats.commissionRate.toFixed(1)}%`}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Commission Rate</h3>
          <p className="text-sm text-gray-600">Platform fee percentage</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="chart-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Overview</h3>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 0 150 Q 50 120 100 130 T 200 100 T 300 80 T 400 60" 
                    stroke="#8B5CF6" strokeWidth="3" fill="none"/>
              <path d="M 0 150 Q 50 120 100 130 T 200 100 T 300 80 T 400 60 L 400 200 L 0 200 Z" 
                    fill="url(#revenueGradient)"/>
            </svg>
          </div>
        </div>

        {/* User Growth */}
        <div className="chart-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Growth</h3>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>This month</option>
              <option>Last month</option>
              <option>Last quarter</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Registrations</span>
              <span className="font-semibold text-gray-900">
                {loading ? '...' : stats.newRegistrations.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ 
                width: `${Math.min((stats.newRegistrations / stats.totalUsers) * 100, 100)}%` 
              }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-gray-900">
                {loading ? '...' : stats.activeUsers.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ 
                width: `${Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)}%` 
              }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-semibold text-gray-900">
                {loading ? '...' : stats.activeTasks.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ 
                width: `${Math.min((stats.activeTasks / 100) * 100, 100)}%` 
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {loading && (
            <div className="text-center text-gray-500 py-8">Loading recent activity...</div>
          )}
          {!loading && recentActivity.length === 0 && (
            <div className="text-center text-gray-500 py-8">No recent activity</div>
          )}
          {!loading && recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                <i className={`${activity.icon} text-${activity.color}-600`}></i>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.message}</p>
                <p className="text-gray-500 text-sm">{activity.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <i className="ri-more-line"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
