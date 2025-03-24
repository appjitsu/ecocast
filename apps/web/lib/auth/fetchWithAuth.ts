import Cookies from 'js-cookie';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const { requireAuth = true, headers = {}, ...rest } = options;

  // Get the access token from cookies
  const accessToken = Cookies.get('accessToken');

  // If authentication is required but no token exists, throw an error
  if (requireAuth && !accessToken) {
    throw new Error('Authentication required');
  }

  // Add authorization header if token exists
  const authHeaders: Record<string, string> = {};
  if (accessToken) {
    authHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // Merge headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
    ...authHeaders,
  };

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  });

  // If the response is 401 Unauthorized, the token might be expired
  // The auth context will handle token refresh automatically
  if (response.status === 401 && requireAuth) {
    throw new Error('Unauthorized');
  }

  return response;
}
