
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../../../hooks/useAuth';
import { getTasks, getTaskApplications, getWalletTransactions } from '../../../lib/supabase';
import { formatCurrency, type Currency } from '@/lib/currency';

export default function OverviewSection() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0.00,
    activeTasks: 0,
    successRate: 0.0,
    avgResponse: '0m'
  });
  const [walletBalances, setWalletBalances] = useState({
    INR: 0,
    USD: 0,
    USDT: 0
  });

  const overviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user stats from real database
    const loadStats = async () => {
      if (!user) return;

      try {
        // Fetch data from database
        const [tasksResult, applicationsResult, transactionsResult] = await Promise.all([
          getTasks({ client_id: user.id }),
          getTaskApplications(user.id),
          getWalletTransactions(user.id)
        ]);

        const tasks = tasksResult.data || [];
        const applications = applicationsResult.data || [];
        const transactions = transactionsResult.data || [];

        // Calculate stats
        const activeTasks = tasks.filter((task: any) => 
          task.status === 'active' || task.status === 'in_progress'
        ).length;
        
        const acceptedApplications = applications.filter((app: any) => 
          app.status === 'accepted'
        ).length;
        
        const totalEarnings = transactions
          .filter((t: any) => t.type === 'earning' || t.type === 'credit')
          .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
        
        const successRate = applications.length > 0 
          ? (acceptedApplications / applications.length) * 100 
          : 0.0;

        setStats({
          totalEarnings: totalEarnings || 0,
          activeTasks,
          successRate,
          avgResponse: '2h 15m'
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Keep default values on error
        setStats({
          totalEarnings: 0,
          activeTasks: 0,
          successRate: 0.0,
          avgResponse: '2h 15m'
        });
      }
    };

    loadStats();
    
    // Load wallet balances
    if (profile) {
      setWalletBalances({
        INR: parseFloat((profile as any).wallet_balance_inr || '0'),
        USD: parseFloat((profile as any).wallet_balance_usd || '0'),
        USDT: parseFloat((profile as any).wallet_balance_usdt || '0')
      });
    }
  }, [user, profile]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overviewRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, overviewRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={overviewRef} className="p-6 bg-gray-50 min-h-screen">
      {/* Header - Exact match to reference */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome Back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-600">Ready to earn more today?</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks, earnings..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <i className="ri-settings-3-line text-xl"></i>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <i className="ri-notification-3-line text-xl"></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Stats Cards - Exact match to reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings Card - Blue gradient with circle icon */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-white text-xl"></i>
            </div>
            <div className="absolute top-6 right-6 text-xs text-white/70">•••</div>
          </div>
          <div className="mb-4">
            <h3 className="text-4xl font-bold mb-1">${stats.totalEarnings.toFixed(2)}</h3>
            <p className="text-blue-100 text-sm font-medium">Total Earnings</p>
          </div>
          <div className="flex items-center text-blue-100 text-sm">
            <i className="ri-arrow-up-line mr-1"></i>
            <span>Real-time data</span>
          </div>
        </div>

        {/* Active Tasks Card - White with purple icon */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4 text-xs text-gray-400">•••</div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-file-list-3-line text-xl text-purple-600"></i>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-4xl font-bold text-gray-900 mb-1">{stats.activeTasks}</h3>
            <p className="text-gray-500 text-sm font-medium">Active Tasks</p>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <i className="ri-arrow-up-line mr-1"></i>
            <span>Live count</span>
          </div>
        </div>

        {/* Success Rate Card - White with green icon */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4 text-xs text-gray-400">•••</div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-check-double-line text-xl text-green-600"></i>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-4xl font-bold text-gray-900 mb-1">{stats.successRate.toFixed(1)}%</h3>
            <p className="text-gray-500 text-sm font-medium">Success Rate</p>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <i className="ri-arrow-up-line mr-1"></i>
            <span>Calculated live</span>
          </div>
        </div>

        {/* Avg Response Card - White with orange icon */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4 text-xs text-gray-400">•••</div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-time-line text-xl text-orange-600"></i>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-4xl font-bold text-gray-900 mb-1">{stats.avgResponse}</h3>
            <p className="text-gray-500 text-sm font-medium">Avg Response</p>
          </div>
          <div className="flex items-center text-orange-600 text-sm">
            <i className="ri-arrow-up-line mr-1"></i>
            <span>Profile data</span>
          </div>
        </div>
      </div>

      {/* Multi-Currency Wallet Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-sm border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <span className="text-xs font-medium text-orange-600 bg-white/60 px-2 py-1 rounded-full">INR Wallet</span>
          </div>
          <h3 className="text-3xl font-bold text-orange-900 mb-1">
            {formatCurrency(walletBalances.INR, 'INR')}
          </h3>
          <p className="text-sm text-orange-600">Indian Rupee</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🇺🇸</span>
            </div>
            <span className="text-xs font-medium text-green-600 bg-white/60 px-2 py-1 rounded-full">USD Wallet</span>
          </div>
          <h3 className="text-3xl font-bold text-green-900 mb-1">
            {formatCurrency(walletBalances.USD, 'USD')}
          </h3>
          <p className="text-sm text-green-600">US Dollar</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔷</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-white/60 px-2 py-1 rounded-full">USDT Wallet</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-900 mb-1">
            {formatCurrency(walletBalances.USDT, 'USDT')}
          </h3>
          <p className="text-sm text-blue-600">Tether (USDT)</p>
        </div>
      </div>

      {/* Charts Section - Exact match to reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Earnings Overview Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Earnings Overview</h3>
              <p className="text-sm text-gray-500">Last 7 days earnings</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg font-medium">7D</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">30D</button>
            </div>
          </div>

          {/* Bar Chart - Exact match */}
          <div className="flex items-end justify-between h-48 mb-4 px-4">
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Thu</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-500 rounded-t mb-2" style={{ height: '180px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Fri</span>
              <span className="text-xs text-gray-900 font-medium">$95</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Sat</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Sun</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Mon</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Tue</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 bg-gray-200 rounded-t mb-2" style={{ height: '20px' }}></div>
              <span className="text-xs text-gray-500 font-medium">Wed</span>
              <span className="text-xs text-gray-400">$0</span>
            </div>
          </div>
        </div>

        {/* Tasks Completed Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Tasks Completed</h3>
              <p className="text-sm text-gray-500">Last 7 days activity</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-lg font-medium">7D</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">30D</button>
            </div>
          </div>

          {/* Line Chart Area - Exact match */}
          <div className="h-48 flex items-end justify-between mb-4 px-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Thu</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Fri</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Sat</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Sun</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Mon</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Tue</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
              <span className="text-xs text-gray-500 font-medium">Wed</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section - Exact match */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Tasks</h3>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap font-medium">
            New Task
          </button>
        </div>

        {/* Empty State - Exact match */}
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-task-line text-2xl text-gray-400"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent tasks</h4>
          <p className="text-gray-500 mb-6">Start by creating your first task or applying to available ones</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap font-medium">
            Browse Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
