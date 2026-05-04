/**
 * Centralized API client for Pixel Store.
 * Connects to the backend server (which in turn uses Roblox APIs or scraping).
 * This allows easily changing the base URL when deploying to production.
 */

import { io } from 'socket.io-client';
export const SERVER_URL = 'https://lotus-sells-type-pursuit.trycloudflare.com';
export const BASE_URL = `${SERVER_URL}/api`;
export const socket = io(SERVER_URL);

/**
 * Helper for making API requests
 */
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = localStorage.getItem('pixel_token');

    // Don't set Content-Type if we're sending FormData
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const RobloxAPI = {
  /**
   * Search for a Roblox user by keyword (username)
   */
  searchUser: async (keyword: string) => {
    return fetchAPI(`/users/search?keyword=${encodeURIComponent(keyword)}`);
  },

  /**
   * Get Roblox user details by ID
   */
  getUserById: async (userId: string | number) => {
    return fetchAPI(`/users/${userId}`);
  },

  /**
   * Get user avatar thumbnail
   */
  getUserThumbnail: async (userId: string | number, size: string = '150x150') => {
    return fetchAPI(`/thumbnails/avatar-headshot?userIds=${userId}&size=${size}`);
  },

  /**
   * Get places owned by a user
   */
  getUserPlaces: async (userId: string | number) => {
    return fetchAPI(`/users/${userId}/places`);
  },

  /**
   * Get all gamepasses from a specific place
   */
  getPlaceGamepasses: async (placeId: string | number, userId?: string | number) => {
    return fetchAPI(`/places/${placeId}/gamepasses${userId ? `?userId=${userId}` : ''}`);
  },

  /**
   * Get details of a specific gamepass
   */
  getGamepassDetails: async (gamepassId: string | number) => {
    return fetchAPI(`/gamepasses/${gamepassId}`);
  },

  /**
   * Check if a user is in a specific group
   */
  checkUserInGroup: async (userId: string | number, groupId: string | number) => {
    return fetchAPI(`/users/${userId}/groups/${groupId}/status`);
  },

  /**
   * Get required groups configuration
   */
  getGroupsConfig: async () => {
    return fetchAPI('/groups/config');
  },

  /**
   * Update required groups configuration
   */
  updateGroupsConfig: async (groups: any) => {
    return fetchAPI('/groups/config', {
      method: 'POST',
      body: JSON.stringify({ groups })
    });
  },

  /**
   * Check user membership in all required groups
   */
  checkUserGroups: async (userId: string | number) => {
    return fetchAPI(`/groups/check/${userId}`);
  },

  /**
   * Get user collectibles (limiteds) via proxy
   */
  getUserCollectibles: async (userId: string | number) => {
    return fetchAPI(`/users/${userId}/collectibles`);
  },

  /**
   * Get group icons via proxy
   */
  getGroupIcons: async (groupIds: string) => {
    return fetchAPI(`/groups/icons?groupIds=${groupIds}`);
  }
};

export const OrdersAPI = {
  /**
   * Create a new order (with receipt upload)
   */
  createOrder: async (formData: FormData) => {
    return fetchAPI('/orders', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Get user orders
   */
  getUserOrders: async (userId: string) => {
    return fetchAPI(`/orders/user/${userId}`);
  },

  /**
   * Mark all pending orders as seen
   */
  markAllSeen: async (userId: number) => {
    return fetchAPI('/orders/mark-all-seen', {
      method: 'PUT',
      body: JSON.stringify({ userId })
    });
  },

  /**
   * Get recent public orders
   */
  getRecentOrders: async () => {
    return fetchAPI('/orders/recent');
  },

  /**
   * Get order statistics (24h completed)
   */
  getOrderStats: async () => {
    return fetchAPI('/orders/stats');
  }
};

export const StoreAPI = {
  getProducts: async () => {
    return fetchAPI('/products');
  },

  // Admin Endpoints
  getRobuxConfig: async () => {
    return fetchAPI('/admin/robux-config');
  },
  updateRobuxConfig: async (config: any) => {
    return fetchAPI('/admin/robux-config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  },
  getGamesConfig: async () => {
    return fetchAPI('/admin/games-config');
  },
  updateGamesConfig: async (games: any) => {
    return fetchAPI('/admin/games-config', {
      method: 'POST',
      body: JSON.stringify({ games })
    });
  },
  getCategoriesConfig: async () => {
    return fetchAPI('/admin/categories-config');
  },
  updateCategoriesConfig: async (categories: any) => {
    return fetchAPI('/admin/categories-config', {
      method: 'POST',
      body: JSON.stringify({ categories })
    });
  },
  updateProductsConfig: async (products: any) => {
    return fetchAPI('/admin/products-config', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  },
  getCurrenciesConfig: async () => {
    return fetchAPI('/admin/currencies-config');
  },
  updateCurrenciesConfig: async (currencies: any) => {
    return fetchAPI('/admin/currencies-config', {
      method: 'POST',
      body: JSON.stringify({ currencies })
    });
  },
  getPaymentMethodsConfig: () => fetchAPI('/admin/payment-methods-config'),
  updatePaymentMethodsConfig: (paymentMethods: any) => fetchAPI('/admin/payment-methods-config', { method: 'POST', body: JSON.stringify({ paymentMethods }) }),
  getHomePopularCategories: () => fetchAPI('/admin/home-popular-categories'),
  updateHomePopularCategories: (categories: any) => fetchAPI('/admin/home-popular-categories', { method: 'POST', body: JSON.stringify({ categories }) }),
  uploadImage: (formData: FormData) => fetchAPI('/admin/upload', { method: 'POST', body: formData }),
  updateOrderStatus: async (orderId: string, status: string) => {
    return fetchAPI(`/admin/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },
  getOrders: async () => {
    return fetchAPI('/admin/orders');
  },
  getLimitedsConfig: async () => {
    return fetchAPI('/admin/limiteds-config');
  },
  updateLimitedsConfig: async (limiteds: any) => {
    return fetchAPI('/admin/limiteds-config', {
      method: 'POST',
      body: JSON.stringify({ limiteds })
    });
  },
  getMm2Config: async () => {
    return fetchAPI('/admin/mm2-config');
  },
  updateMm2Config: async (items: any) => {
    return fetchAPI('/admin/mm2-config', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },
  getCategoryIconsConfig: async () => {
    return fetchAPI('/admin/category-icons-config');
  },
  updateCategoryIconsConfig: async (icons: any) => {
    return fetchAPI('/admin/category-icons-config', {
      method: 'POST',
      body: JSON.stringify({ icons })
    });
  }
};

export const AuthAPI = {
  login: async (credentials: any) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  register: async (userData: any) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  getProfile: async () => {
    return fetchAPI('/auth/profile');
  },
  updateProfile: async (data: any) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

export const ChatAPI = {
  getChats: async () => {
    return fetchAPI('/chats');
  },
  getMessages: async (chatId: number) => {
    return fetchAPI(`/chats/${chatId}/messages`);
  },
  sendMessage: async (text: string, chatId?: number, orderId?: string, type?: string, fileUrl?: string) => {
    return fetchAPI('/chats/message', {
      method: 'POST',
      body: JSON.stringify({ chatId, text, orderId, type, fileUrl })
    });
  },
  getUnreadCount: async () => {
    return fetchAPI('/chats/unread-count');
  },
  markAsRead: async (chatId: number) => {
    return fetchAPI(`/chats/${chatId}/read`, {
      method: 'POST'
    });
  },
  markAllAsRead: async (userId: number) => {
    return fetchAPI('/chats/mark-all-read', {
      method: 'PUT',
      body: JSON.stringify({ userId })
    });
  },
  deleteChat: async (chatId: number) => {
    return fetchAPI(`/chats/${chatId}`, {
      method: 'DELETE'
    });
  },
  uploadFile: async (formData: FormData) => {
    return fetch(`${SERVER_URL}/api/chats/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('pixel_token')}`
      },
      body: formData
    }).then(res => res.json());
  }
};

export const ReviewsAPI = {
  getReviews: async () => {
    return fetchAPI('/reviews');
  },
  createReview: async (formData: FormData) => {
    return fetchAPI('/reviews', {
      method: 'POST',
      body: formData
    });
  }
};
