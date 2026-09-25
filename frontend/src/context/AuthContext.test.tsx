import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const debater = { id: 1, username: 'debater1', fullName: 'Debater One', role: 'DEBATER' };
const judge = { id: 2, username: 'judge1', fullName: 'Judge One', role: 'JUDGE' };

/** Tiny consumer that exposes the context through the DOM. */
function Probe() {
  const { user, isAuthenticated, selectedRole, login, logout, setSelectedRole, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.username ?? '-'}</span>
      <span data-testid="bio">{(user as { bio?: string } | null)?.bio ?? '-'}</span>
      <span data-testid="role">{selectedRole ?? '-'}</span>
      <button onClick={() => login('JWT-1', debater as never)}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => setSelectedRole('JUDGE')}>pick-judge</button>
      <button onClick={() => updateUser({ bio: 'Updated bio' } as never)}>update</button>
    </div>
  );
}

const renderProbe = () => render(<AuthProvider><Probe /></AuthProvider>);

/** Simulates another browser tab writing to localStorage. */
function otherTabWrites(token: string | null, user: object | null) {
  if (token) localStorage.setItem('dms_token', token); else localStorage.removeItem('dms_token');
  if (user) localStorage.setItem('dms_user', JSON.stringify(user)); else localStorage.removeItem('dms_user');
  act(() => { window.dispatchEvent(new StorageEvent('storage', { key: 'dms_token' })); });
}

describe('AuthContext', () => {
  it('starts logged out when nothing is stored', () => {
    renderProbe();
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  it('restores a saved session from localStorage on page reload', () => {
    localStorage.setItem('dms_token', 'JWT-saved');
    localStorage.setItem('dms_user', JSON.stringify(debater));
    renderProbe();
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
    expect(screen.getByTestId('user')).toHaveTextContent('debater1');
  });

  it('survives corrupted user data in localStorage', () => {
    localStorage.setItem('dms_token', 'JWT');
    localStorage.setItem('dms_user', '{not json');
    renderProbe();
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  it('login stores token and user; logout clears everything', () => {
    renderProbe();
    fireEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
    expect(localStorage.getItem('dms_token')).toBe('JWT-1');

    fireEvent.click(screen.getByText('pick-judge'));
    expect(localStorage.getItem('dms_selected_role')).toBe('JUDGE');

    fireEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
    expect(localStorage.getItem('dms_token')).toBeNull();
    expect(localStorage.getItem('dms_user')).toBeNull();
    expect(localStorage.getItem('dms_selected_role')).toBeNull();
  });

  it('updateUser merges changes and persists them', () => {
    renderProbe();
    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('bio')).toHaveTextContent('Updated bio');
    expect(JSON.parse(localStorage.getItem('dms_user')!).bio).toBe('Updated bio');
  });

  it('warns when another tab logs in as a different user (multi-login conflict fix)', () => {
    renderProbe();
    fireEvent.click(screen.getByText('login'));

    otherTabWrites('JWT-2', judge);

    expect(screen.getByText('User Account Switched')).toBeInTheDocument();
    expect(screen.getByText('judge1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByTestId('user')).toHaveTextContent('judge1');
  });

  it('warns when another tab logs out (session expired fix)', () => {
    renderProbe();
    fireEvent.click(screen.getByText('login'));

    otherTabWrites(null, null);

    expect(screen.getByText('Session Expired / Logged Out')).toBeInTheDocument();
    expect(screen.getByTestId('auth')).toHaveTextContent('no');

    fireEvent.click(screen.getByText('Acknowledge'));
    expect(screen.queryByText('Session Expired / Logged Out')).not.toBeInTheDocument();
  });

  it('useAuth outside the provider throws a clear error', () => {
    const Broken = () => { useAuth(); return null; };
    expect(() => render(<Broken />)).toThrow('useAuth must be used within AuthProvider');
  });
});
