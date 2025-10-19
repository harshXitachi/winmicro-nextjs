
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getTasks, createTask, applyToTask, sendMessage, deleteTask } from '@/lib/supabase';
import Link from 'next/link';

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
  applications_count: number;
}

export default function Marketplace() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [filters, setFilters] = useState({
    category: 'all',
    budget_min: '',
    budget_max: '',
    search: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Social Media Tasks',
    budget: '',
    deadline: '',
    skills_required: ''
  });

  const [application, setApplication] = useState({
    proposal: '',
    timeline: '',
    budget: ''
  });

  useEffect(() => {
    loadTasks();
    if (user) {
      loadMyTasks();
    }
  }, [filters, user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await getTasks(filters);
      if (!error && data) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await getTasks({ client_id: user.id, status: '' });
      if (!error && data) {
        setMyTasks(data);
      }
    } catch (error) {
      console.error('Error loading my tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!user || !profile) return;

    try {
      const taskData = {
        ...newTask,
        budget: parseFloat(newTask.budget),
        client_id: user.id,
        client_name: `${profile.first_name} ${profile.last_name}`,
        skills_required: newTask.skills_required.split(',').map(s => s.trim()),
        priority: parseFloat(newTask.budget) > 1000 ? 'high' : parseFloat(newTask.budget) > 500 ? 'medium' : 'low'
      };

      const { data, error } = await createTask(taskData);
      if (!error && data) {
        setTasks([data, ...tasks]);
        setMyTasks([data, ...myTasks]);
        setShowCreateModal(false);
        setNewTask({
          title: '',
          description: '',
          category: 'Social Media Tasks',
          budget: '',
          deadline: '',
          skills_required: ''
        });
        alert('Task created successfully!');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await deleteTask(taskId);
      if (!error) {
        setMyTasks(myTasks.filter(task => task.id !== taskId));
        setTasks(tasks.filter(task => task.id !== taskId));
        alert('Task deleted successfully!');
      } else {
        alert('Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleApplyToTask = async () => {
    if (!user || !profile || !selectedTask) return;

    try {
      const applicationData = {
        cover_letter: application.proposal,
        estimated_duration: application.timeline,
        proposed_budget: parseFloat(application.budget)
      };

      const { data, error } = await applyToTask(selectedTask.id, applicationData);
      if (!error && data) {
        setTasks(tasks.map(task =>
          task.id === selectedTask.id
            ? { ...task, applications_count: task.applications_count + 1 }
            : task
        ));

        setShowApplyModal(false);
        setSelectedTask(null);
        setApplication({
          proposal: '',
          timeline: '',
          budget: ''
        });
        setShowSuccessModal(true);
      } else {
        alert(error?.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error applying to task:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  // Updated categories for micro-tasks
  const categories = [
    'Social Media Tasks',
    'Email Creation',
    'YouTube Subscriptions',
    'Instagram Engagement',
    'Data Entry',
    'Survey Completion',
    'App Downloads',
    'Website Testing',
    'Content Moderation',
    'Online Reviews',
    'Form Filling',
    'Image Tagging',
    'Video Watching',
    'Account Creation',
    'Other Micro Tasks'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700';
      case 'medium':
        return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700';
      case 'low':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Social Media Tasks':
        return 'ri-share-line';
      case 'Email Creation':
        return 'ri-mail-line';
      case 'YouTube Subscriptions':
        return 'ri-youtube-line';
      case 'Instagram Engagement':
        return 'ri-instagram-line';
      case 'Data Entry':
        return 'ri-database-line';
      case 'Survey Completion':
        return 'ri-questionnaire-line';
      case 'App Downloads':
        return 'ri-smartphone-line';
      case 'Website Testing':
        return 'ri-computer-line';
      case 'Content Moderation':
        return 'ri-shield-check-line';
      case 'Online Reviews':
        return 'ri-star-line';
      case 'Form Filling':
        return 'ri-file-text-line';
      case 'Image Tagging':
        return 'ri-image-line';
      case 'Video Watching':
        return 'ri-play-circle-line';
      case 'Account Creation':
        return 'ri-user-add-line';
      default:
        return 'ri-task-line';
    }
  };

  const getCategoryImage = (category: string) => {
    const imageMap = {
      'Social Media Tasks': 'https://readdy.ai/api/search-image?query=Social%20media%20engagement%20workspace%20with%20multiple%20phones%20showing%20Instagram%2C%20Facebook%2C%20Twitter%20apps%2C%20likes%20and%20shares%20icons%2C%20modern%20digital%20marketing%20setup&width=400&height=300&seq=social1&orientation=landscape',
      'Email Creation': 'https://readdy.ai/api/search-image?query=Email%20creation%20workspace%20with%20laptop%20showing%20email%20templates%2C%20Gmail%20interface%2C%20professional%20email%20setup%2C%20clean%20modern%20desk&width=400&height=300&seq=email1&orientation=landscape',
      'YouTube Subscriptions': 'https://readdy.ai/api/search-image?query=YouTube%20workspace%20with%20laptop%20showing%20YouTube%20interface%2C%20subscribe%20buttons%2C%20video%20thumbnails%2C%20content%20creator%20setup&width=400&height=300&seq=youtube1&orientation=landscape',
      'Instagram Engagement': 'https://readdy.ai/api/search-image?query=Instagram%20engagement%20workspace%20with%20phone%20showing%20Instagram%20app%2C%20heart%20icons%2C%20comment%20bubbles%2C%20social%20media%20influencer%20setup&width=400&height=300&seq=insta1&orientation=landscape',
      'Data Entry': 'https://readdy.ai/api/search-image?query=Data%20entry%20workspace%20with%20computer%20showing%20spreadsheets%2C%20Excel%20sheets%2C%20organized%20documents%2C%20efficient%20office%20environment&width=400&height=300&seq=data1&orientation=landscape',
      'Survey Completion': 'https://readdy.ai/api/search-image?query=Survey%20completion%20workspace%20with%20tablet%20showing%20online%20forms%2C%20questionnaires%2C%20checkboxes%2C%20research%20environment&width=400&height=300&seq=survey1&orientation=landscape',
      'App Downloads': 'https://readdy.ai/api/search-image?query=App%20store%20workspace%20with%20smartphone%20showing%20app%20store%20interface%2C%20download%20buttons%2C%20mobile%20apps%20icons%2C%20tech%20environment&width=400&height=300&seq=apps1&orientation=landscape',
      'Website Testing': 'https://readdy.ai/api/search-image?query=Website%20testing%20workspace%20with%20multiple%20devices%20showing%20websites%2C%20browser%20testing%2C%20QA%20environment%2C%20tech%20setup&width=400&height=300&seq=testing1&orientation=landscape',
      'Content Moderation': 'https://readdy.ai/api/search-image?query=Content%20moderation%20workspace%20with%20computer%20showing%20social%20media%20feeds%2C%20moderation%20tools%2C%20safety%20icons%2C%20professional%20setup&width=400&height=300&seq=moderation1&orientation=landscape',
      'Online Reviews': 'https://readdy.ai/api/search-image?query=Online%20reviews%20workspace%20with%20laptop%20showing%20review%20websites%2C%20star%20ratings%2C%20feedback%20forms%2C%20customer%20service%20environment&width=400&height=300&seq=reviews1&orientation=landscape',
      'Form Filling': 'https://readdy.ai/api/search-image?query=Form%20filling%20workspace%20with%20computer%20showing%20online%20forms%2C%20input%20fields%2C%20document%20processing%2C%20administrative%20setup&width=400&height=300&seq=forms1&orientation=landscape',
      'Image Tagging': 'https://readdy.ai/api/search-image?query=Image%20tagging%20workspace%20with%20computer%20showing%20photo%20galleries%2C%20tagging%20tools%2C%20image%20recognition%2C%20digital%20asset%20management&width=400&height=300&seq=tagging1&orientation=landscape',
      'Video Watching': 'https://readdy.ai/api/search-image?query=Video%20watching%20workspace%20with%20large%20monitor%20showing%20video%20player%2C%20entertainment%20setup%2C%20comfortable%20viewing%20environment&width=400&height=300&seq=video1&orientation=landscape',
      'Account Creation': 'https://readdy.ai/api/search-image?query=Account%20creation%20workspace%20with%20laptop%20showing%20registration%20forms%2C%20user%20profiles%2C%20sign%20up%20pages%2C%20digital%20onboarding&width=400&height=300&seq=accounts1&orientation=landscape',
      'Other Micro Tasks': 'https://readdy.ai/api/search-image?query=General%20micro%20tasks%20workspace%20with%20various%20devices%2C%20task%20management%20tools%2C%20productivity%20setup%2C%20versatile%20work%20environment&width=400&height=300&seq=micro1&orientation=landscape'
    };
    return imageMap[category as keyof typeof imageMap] || imageMap['Other Micro Tasks'];
  };

  const currentTasks = activeTab === 'browse' ? tasks : myTasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
                </div>
                <span className="font-semibold">Back to Dashboard</span>
              </Link>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Micro Task Marketplace
                </h1>
                <p className="text-sm text-gray-600">Complete small tasks and earn money instantly</p>
              </div>
            </div>
            
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl whitespace-nowrap cursor-pointer transform hover:scale-105 flex items-center space-x-2"
              >
                <i className="ri-add-line text-xl"></i>
                <span>Post Micro Task</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="pt-8 pb-16">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=Micro%20task%20marketplace%20with%20people%20completing%20small%20digital%20tasks%20on%20phones%20and%20laptops%2C%20social%20media%20engagement%2C%20email%20creation%2C%20modern%20workspace&width=1200&height=600&seq=micro-hero&orientation=landscape')] bg-cover bg-center opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  Earn Money with
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Micro Tasks
                  </span>
                </h1>
                <p className="text-xl opacity-90 mb-8 leading-relaxed">
                  Complete simple tasks like creating emails, subscribing to YouTube channels, liking Instagram posts, and more. Start earning instantly!
                </p>
                <div className="flex flex-wrap gap-6">
                  <button className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl transform hover:scale-105">
                    Start Earning Now
                  </button>
                  <button className="px-10 py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105">
                    Post a Task
                  </button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold">5000+</div>
                    <div className="text-sm opacity-80">Tasks Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">₹2-500</div>
                    <div className="text-sm opacity-80">Per Task</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm opacity-80">Available</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://readdy.ai/api/search-image?query=Person%20completing%20micro%20tasks%20on%20smartphone%2C%20social%20media%20apps%2C%20email%20creation%2C%20YouTube%20subscription%2C%20Instagram%20likes%2C%20earning%20money%20online&width=600&height=500&seq=micro-side&orientation=landscape"
                  alt="Micro task completion"
                  className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-money-rupee-circle-line text-green-600 text-2xl"></i>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">₹2,450</p>
                      <p className="text-sm text-gray-600">Earned Today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-12">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex rounded-2xl p-2 bg-gradient-to-r from-gray-100 to-gray-200">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    activeTab === 'browse'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                  }`}
                >
                  <i className="ri-search-line mr-2"></i>
                  Browse Micro Tasks
                </button>
                {user && (
                  <button
                    onClick={() => setActiveTab('my-posts')}
                    className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      activeTab === 'my-posts'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                    }`}
                  >
                    <i className="ri-file-list-line mr-2"></i>
                    My Posted Tasks ({myTasks.length})
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Search & Filters */}
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                    <input
                      type="text"
                      placeholder="Search micro tasks, skills, or keywords..."
                      value={filters.search}
                      onChange={e => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 text-lg"
                    />
                  </div>
                </div>

                <select
                  value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8 shadow-sm transition-all duration-300 text-lg"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min Budget (₹)"
                  value={filters.budget_min}
                  onChange={e => setFilters({ ...filters, budget_min: e.target.value })}
                  className="px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 text-lg"
                />

                <input
                  type="number"
                  placeholder="Max Budget (₹)"
                  value={filters.budget_max}
                  onChange={e => setFilters({ ...filters, budget_max: e.target.value })}
                  className="px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 text-lg"
                />
              </div>
            )}
          </div>

          {/* Enhanced Categories Section */}
          {activeTab === 'browse' && (
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Popular Micro Task Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {categories.slice(0, 10).map(category => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:scale-105 ${
                      filters.category === category
                        ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={getCategoryImage(category)}
                        alt={category}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                        <i className={`${getCategoryIcon(category)} text-4xl mb-3 drop-shadow-lg`}></i>
                        <span className="text-sm font-bold text-center drop-shadow-lg leading-tight">{category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Tasks Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-900">
                {activeTab === 'browse'
                  ? filters.category === 'all'
                    ? 'Available Micro Tasks'
                    : `${filters.category} Tasks`
                  : 'My Posted Tasks'}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-semibold text-lg">{currentTasks.length} tasks available</span>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <p className="text-gray-600 text-xl">Loading micro tasks...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-xl">
                <i className="ri-task-line text-8xl text-gray-300 mb-6"></i>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {activeTab === 'browse' ? 'No micro tasks found' : 'No tasks posted yet'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                  {activeTab === 'browse'
                    ? 'Try adjusting your filters or be the first to post a micro task!'
                    : 'Start by posting your first micro task to find skilled workers!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                  >
                    {/* Enhanced Task Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300">
                          <i className={`${getCategoryIcon(task.category)} text-indigo-600 text-2xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{task.title}</h3>
                          <p className="text-sm text-gray-500 font-semibold">{task.category}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-2 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>

                    {/* Task Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">{task.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {task.skills_required?.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-xl font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {task.skills_required?.length > 3 && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-xl font-semibold">
                          +{task.skills_required.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Budget:</span>
                        <span className="font-bold text-green-600 text-lg">
                          ₹{task.budget?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Deadline:</span>
                        <span className="text-gray-700 font-semibold">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Applications:</span>
                        <span className="text-gray-700 font-bold">{task.applications_count || 0}</span>
                      </div>
                    </div>

                    {/* Client Info & Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{task.client_name?.charAt(0) || '?'}</span>
                        </div>
                        <span className="text-sm text-gray-700 font-semibold">{task.client_name || 'Unknown'}</span>
                      </div>

                      {activeTab === 'browse' ? (
                        user && user.id !== task.client_id && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowApplyModal(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-bold whitespace-nowrap cursor-pointer transform hover:scale-105 shadow-lg"
                          >
                            Apply Now
                          </button>
                        )
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 text-sm font-bold whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-3xl text-green-600"></i>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Your application has been sent to the task owner. They will receive a message in their inbox.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Post New Micro Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                  placeholder="e.g., Create 10 Gmail accounts, Subscribe to YouTube channel"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                  placeholder="Describe the micro task requirements in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8 transition-all duration-300 text-lg"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Budget (₹)</label>
                  <input
                    type="number"
                    value={newTask.budget}
                    onChange={e => setNewTask({ ...newTask, budget: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                    placeholder="Enter your budget"
                    min="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Required Skills</label>
                <input
                  type="text"
                  value={newTask.skills_required}
                  onChange={e => setNewTask({ ...newTask, skills_required: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                  placeholder="Enter skills separated by commas (e.g., Email Creation, Social Media, Data Entry)"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.description || !newTask.budget || !newTask.deadline}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                Post Micro Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Apply for Micro Task</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Task Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 text-xl">{selectedTask.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{selectedTask.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Budget: ₹{selectedTask.budget.toLocaleString()}</span>
                <span className="text-gray-500">Deadline: {new Date(selectedTask.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Your Proposal</label>
                <textarea
                  value={application.proposal}
                  onChange={e => setApplication({ ...application, proposal: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                  placeholder="Explain why you're the best fit for this micro task..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Timeline</label>
                  <input
                    type="text"
                    value={application.timeline}
                    onChange={e => setApplication({ ...application, timeline: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                    placeholder="e.g., 2-3 hours, 1 day"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Your Bid (₹)</label>
                  <input
                    type="number"
                    value={application.budget}
                    onChange={e => setApplication({ ...application, budget: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
                    placeholder="Enter your bid"
                    max={selectedTask.budget}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyToTask}
                disabled={!application.proposal || !application.timeline || !application.budget}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
