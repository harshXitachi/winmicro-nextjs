// API client for interacting with the backend

const API_BASE = '/api';

// Auth functions
export const signUp = async (email: string, password: string, metadata?: any) => {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        first_name: metadata?.first_name || '',
        last_name: metadata?.last_name || '',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || 'Signup failed');
      return { data: null, error: new Error(errorMessage) };
    }

    return { data: { user: data.user, session: null }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Signin failed') };
    }

    return { data: { user: data.user, session: null }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/signout`, {
      method: 'POST',
      credentials: 'include', // Important: Include credentials to clear cookies
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: new Error(data.error || 'Signout failed') };
    }

    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return { user: data.user || null, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

// Tasks functions
export const getTasks = async (filters?: any) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
    }

    const response = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch tasks') };
    }

    return { data: data.tasks || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const createTask = async (taskData: any) => {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to create task') };
    }

    return { data: data.task, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      return { data: null, error: new Error(data.error || 'Failed to delete task') };
    }

    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Profile functions
export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/profile/${userId}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to fetch profile') };
    }

    return { data: data.profile, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const response = await fetch(`${API_BASE}/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to update profile') };
    }

    return { data: data.profile, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Wallet functions
export const getWalletTransactions = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/wallet/transactions?userId=${userId}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch transactions') };
    }

    return { data: data.transactions || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const updateWalletBalance = async (userId: string, amount: number, type: 'credit' | 'debit') => {
  try {
    const response = await fetch(`${API_BASE}/wallet/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, amount, type }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to update balance') };
    }

    return { data: data.profile, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Admin functions
export const getAdminSettings = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/settings`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to fetch settings') };
    }

    return { data: data.settings, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const updateAdminSettings = async (settings: any) => {
  try {
    const response = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to update settings') };
    }

    return { data: data.settings, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/users`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch users') };
    }

    return { data: data.users || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/transactions`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch transactions') };
    }

    return { data: data.transactions || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

// Messages
export const getMessages = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch messages') };
    }

    return { data: data.data || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const sendMessage = async (messageData: any) => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(messageData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to send message') };
    }

    return { data: data.data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Applications
export const applyToTask = async (taskId: string, applicationData: any) => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ task_id: taskId, ...applicationData }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to apply to task') };
    }

    return { data: data.data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const getTaskApplications = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/applications?freelancer_id=${userId}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch applications') };
    }

    return { data: data.data || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ application_id: applicationId, status }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to update application') };
    }

    return { data: data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Helper functions for compatibility
export const isAdmin = async (userId: string) => {
  const { user } = await getCurrentUser();
  return { isAdmin: user?.role === 'admin', error: null };
};

export const ensureUserProfile = async (userId: string, profileData: any) => {
  return updateUserProfile(userId, profileData);
};

export const checkUsernameExists = async (username: string) => {
  return { exists: false, error: null };
};

export const createWalletTransaction = async (transactionData: any) => {
  return { data: null, error: null };
};

export const createPaymentTransaction = async (transactionData: any) => {
  return { data: null, error: null };
};

export const getPaymentTransactions = async (userId: string) => {
  return { data: [], error: null };
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message_id: messageId }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: new Error(data.error || 'Failed to mark message as read') };
    }

    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Payments
export const sendPayment = async (paymentData: any) => {
  try {
    const response = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(data.error || 'Failed to send payment') };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await fetch(`${API_BASE}/payments`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: [], error: new Error(data.error || 'Failed to fetch payments') };
    }

    return { data: data.data || [], error: null };
  } catch (error: any) {
    return { data: [], error };
  }
};

export const getAdminUser = async (email: string) => {
  return { data: null, error: null };
};

// Mock supabase object for compatibility
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
      }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
      filter: (column: string, operator: string, value: any) => Promise.resolve({ data: [], error: null })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    }),
    upsert: (data: any, options?: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } })
    })
  },
  auth: {
    getUser: (token: string) => Promise.resolve({ data: { user: null }, error: null })
  },
  rpc: (functionName: string, params: any) => Promise.resolve({ data: null, error: null })
};

export default supabase;
