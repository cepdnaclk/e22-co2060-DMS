import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import api from './axios';

const originalLocation = window.location;
let lastRequest: InternalAxiosRequestConfig | null = null;

/** Replaces the network layer: records the request and answers with the given status. */
function respondWith(status: number) {
  api.defaults.adapter = async (config) => {
    lastRequest = config;
    const response = { status, statusText: String(status), data: {}, headers: {}, config };
    if (status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
    }
    return response;
  };
}

describe('API client (axios interceptors)', () => {
  beforeEach(() => {
    lastRequest = null;
    Object.defineProperty(window, 'location', { value: { href: '/dashboard/debater' }, writable: true });
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it('attaches the stored JWT as a Bearer token', async () => {
    localStorage.setItem('dms_token', 'JWT-123');
    respondWith(200);
    await api.get('/notifications');
    expect(lastRequest?.headers.Authorization).toBe('Bearer JWT-123');
  });

  it('sends no Authorization header when logged out', async () => {
    respondWith(200);
    await api.get('/tournaments');
    expect(lastRequest?.headers.Authorization).toBeUndefined();
  });

  it('on 401 clears the session and sends the user to /login', async () => {
    localStorage.setItem('dms_token', 'expired');
    localStorage.setItem('dms_user', '{"id":1}');
    respondWith(401);

    await expect(api.get('/notifications')).rejects.toBeInstanceOf(AxiosError);
    expect(localStorage.getItem('dms_token')).toBeNull();
    expect(localStorage.getItem('dms_user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('on 403 keeps the session (only 401 is treated as an expired login)', async () => {
    localStorage.setItem('dms_token', 'JWT');
    respondWith(403);

    await expect(api.post('/tournaments', {})).rejects.toBeInstanceOf(AxiosError);
    expect(localStorage.getItem('dms_token')).toBe('JWT');
    expect(window.location.href).toBe('/dashboard/debater');
  });
});
