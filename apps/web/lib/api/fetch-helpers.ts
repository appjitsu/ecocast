import { getUserFriendlyErrorMessage } from '@repo/utils';
import { fetchWithAuth } from '../auth/fetchWithAuth';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Generic GET request with error handling
 * @param url API endpoint URL
 * @returns API response with data or error
 */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        data: null,
        error: errorData?.message || `Error: ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: getUserFriendlyErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Generic POST request with error handling
 * @param url API endpoint URL
 * @param body Request body
 * @returns API response with data or error
 */
export async function apiPost<T, D = Record<string, unknown>>(
  url: string,
  body: D,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        data: null,
        error: errorData?.message || `Error: ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: getUserFriendlyErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Generic PUT request with error handling
 * @param url API endpoint URL
 * @param body Request body
 * @returns API response with data or error
 */
export async function apiPut<T, D = Record<string, unknown>>(
  url: string,
  body: D,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        data: null,
        error: errorData?.message || `Error: ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: getUserFriendlyErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Generic DELETE request with error handling
 * @param url API endpoint URL
 * @returns API response with data or error
 */
export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        data: null,
        error: errorData?.message || `Error: ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: getUserFriendlyErrorMessage(error),
      status: 500,
    };
  }
}
