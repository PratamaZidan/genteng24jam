import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
  STORIES: `${BASE_URL}/stories`,

  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  SEND_REPORT_TO_ME: (reportId) => `${BASE_URL}/reports/${reportId}/notify-me`,
  SEND_REPORT_TO_USER: (reportId) => `${BASE_URL}/reports/${reportId}/notify`,
  SEND_REPORT_TO_ALL_USER: (reportId) => `${BASE_URL}/reports/${reportId}/notify-all`,
};

// LOGIN
export async function login({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Login Gagal',
      };
    }

    return {
      error: false,
      loginResult: data.loginResult,
    };
  } catch (error) {
    return {
      error: true,
      message: 'Terjadi Kesalahan Jaringan!',
    };
  }
}

// REGISTER
export async function register({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();

    return { ...responseJson, ok: response.ok };
  } catch (error) {
    return {
      ok: false,
      error: true,
      message: 'Terjadi kesalahan jaringan!',
    };
  }
}

// GET STORIES
export async function getStories(token) {
  try {
    const url = new URL(ENDPOINTS.STORIES);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: true,
        message: errorData.message || 'Network error',
        listStory: [],
      };
    }

    const data = await response.json();

    return {
      error: false,
      listStory: data.listStory || [],
      message: data.message || 'Success',
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      error: true,
      message: error.message || 'Network error',
      listStory: [],
    };
  }
}

// ADD STORY
export async function addStory(formData, token) {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      error: !response.ok,
      message: data.message || (response.ok ? 'Success' : 'Failed'),
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

// SUBSCRIBE PUSH NOTIFICATION
export async function subscribePushNotification(subscription, token) {
  const subscriptionJson = subscription.toJSON();

  const payload = {
    endpoint: subscriptionJson.endpoint,
    keys: {
      p256dh: subscriptionJson.keys.p256dh,
      auth: subscriptionJson.keys.auth,
    },
  };

  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

// UNSUBSCRIBE PUSH NOTIFICATION
export async function unsubscribePushNotification(endpoint, token) {
  try {
    const response = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || "Gagal melakukan unsubscribe",
      };
    }

    return {
      error: false,
      data: data.data,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Terjadi kesalahan jaringan",
    };
  }
}

// SEND NOTIFICATION TO ALL USERS
export async function sendReportToAllUserViaNotification(reportId) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return { ok: false, message: 'Access token is missing' };
  }

  console.log('Sending notification with token:', accessToken, 'to reportId:', reportId);

  try {
    const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ALL_USER(reportId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Response status:', fetchResponse.status);

    const json = await fetchResponse.json();

    console.log('Response json:', json);

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('sendReportToAllUserViaNotification error:', error);
    return { ok: false, message: error.message };
  }
}
