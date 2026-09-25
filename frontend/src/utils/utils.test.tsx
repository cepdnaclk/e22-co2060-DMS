import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { getNotificationRoute } from './notificationRouting';
import { toAbsoluteAvatarUrl } from './avatarUrl';
import { ToastProvider, useToast } from '../components/common/Toast';
import type { Notification } from '../types';

const note = (over: Partial<Notification>): Notification =>
  ({ id: 1, title: '', message: '', readStatus: false, createdAt: '', ...over });

describe('getNotificationRoute', () => {
  it('uses an explicit tournament id', () => {
    expect(getNotificationRoute(note({ tournamentId: 7 }))).toBe('/tournament/7');
    expect(getNotificationRoute(note({ tournamentId: 7, matchId: 3 }))).toBe('/tournament/7');
  });

  it('extracts the tournament id from a match code in the message', () => {
    expect(getNotificationRoute(note({
      title: 'New Judging Assignment',
      message: 'You have been assigned as a judge for MATCH-42-3 in Nationals.',
    }))).toBe('/tournament/42');
  });

  it('falls back to the notifications page', () => {
    expect(getNotificationRoute(note({ title: 'Tournament Created', message: "Your tournament 'X' ..." })))
      .toBe('/notifications');
    expect(getNotificationRoute(note({ title: 'Connection Accepted' }))).toBe('/notifications');
  });
});

describe('toAbsoluteAvatarUrl', () => {
  it('returns empty string for missing urls', () => {
    expect(toAbsoluteAvatarUrl(null)).toBe('');
    expect(toAbsoluteAvatarUrl(undefined)).toBe('');
  });

  it('leaves absolute, blob and data urls untouched', () => {
    for (const url of ['https://cdn.x/a.png', 'http://x/a.png', 'blob:abc', 'data:image/png;base64,AA']) {
      expect(toAbsoluteAvatarUrl(url)).toBe(url);
    }
  });

  it('turns a relative backend path into a path on the backend origin', () => {
    expect(toAbsoluteAvatarUrl('/api/users/1/profile-picture')).toBe('/api/users/1/profile-picture');
  });
});

describe('Toast notifications', () => {
  function Trigger() {
    const { showToast } = useToast();
    return <button onClick={() => showToast('Saved!', 'success')}>go</button>;
  }

  it('shows a message and hides it after 4 seconds', async () => {
    const { vi } = await import('vitest');
    vi.useFakeTimers();
    render(<ToastProvider><Trigger /></ToastProvider>);

    fireEvent.click(screen.getByText('go'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(4100); });
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
