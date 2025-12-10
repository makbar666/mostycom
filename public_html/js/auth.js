(function () {
  const API_BASE_URL = window.LOGIN_API_BASE_URL || '/api';
  const TOKEN_KEY = 'mostycomAuthToken';
  const USER_KEY = 'mostycomAuthUser';

  const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  };

  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const buildHeaders = (hasBody = false, includeAuth = true) => {
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (includeAuth) {
      const token = getStoredToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const request = async (path, { method = 'GET', body = null, auth = true } = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: buildHeaders(body !== null, auth),
      body: body ? JSON.stringify(body) : null,
      credentials: 'same-origin'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Permintaan gagal');
    }
    return data;
  };

  const login = async ({ email, password }) => {
    try {
      const result = await request('/login.php', {
        method: 'POST',
        body: { email, password },
        auth: false
      });
      if (result.success && result.token) {
        saveSession(result.token, result.user);
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message || 'Login gagal' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await request('/logout.php', { method: 'POST' });
    } catch (error) {
      // ignore logout errors
    } finally {
      clearSession();
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const result = await request('/me.php');
      if (result.success) {
        const token = getStoredToken();
        if (token) {
          saveSession(token, result.user);
        }
        return { success: true, user: result.user };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const requireAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = 'login.html';
      return null;
    }
    const cachedUser = getStoredUser();
    if (cachedUser) {
      return { success: true, user: cachedUser };
    }
    const refreshed = await fetchCurrentUser();
    if (refreshed.success) {
      return refreshed;
    }
    clearSession();
    window.location.href = 'login.html';
    return null;
  };

  const redirectIfAuth = async (target = 'dashboard.html') => {
    const token = getStoredToken();
    if (!token) return;
    const cachedUser = getStoredUser();
    if (cachedUser) {
      window.location.href = target;
      return;
    }
    const refreshed = await fetchCurrentUser();
    if (refreshed.success) {
      window.location.href = target;
    }
  };

  window.MostycomAuth = {
    login,
    logout,
    getUser: getStoredUser,
    requireAuth,
    redirectIfAuth,
    refreshUser: fetchCurrentUser,
    getToken: getStoredToken,
    clearSession
  };
})();
