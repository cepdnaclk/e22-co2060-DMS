import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Keep route tests focused on access rules: layouts and pages are replaced by markers.
vi.mock('./components/layout/PublicLayout', () => ({ default: () => <div data-testid="protected-content" /> }));
vi.mock('./pages/auth/RoleSelectionPage', () => ({ default: () => <div data-testid="role-select" /> }));

function Where() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderAt(path: string, role?: string) {
  if (role) {
    localStorage.setItem('dms_token', 'JWT');
    localStorage.setItem('dms_user', JSON.stringify({ id: 1, username: 'u', role }));
  }
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
        <Where />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Protected routes (frontend RBAC)', () => {
  it.each(['/dashboard/organizer', '/dashboard/judge', '/dashboard/debater', '/create-tournament',
    '/notifications', '/messages', '/score-sheet/1/2'])(
    'logged-out visitor opening %s is sent to role selection', (path) => {
      renderAt(path);
      expect(screen.getByTestId('path')).toHaveTextContent('/role-select');
    });

  it.each([
    ['/dashboard/organizer', 'DEBATER'],
    ['/dashboard/organizer', 'JUDGE'],
    ['/create-tournament', 'DEBATER'],
    ['/dashboard/judge', 'ORGANIZER'],
    ['/dashboard/debater', 'JUDGE'],
  ])('%s is refused for a %s and redirects home', (path, role) => {
    renderAt(path, role);
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it.each([
    ['/dashboard/organizer', 'ORGANIZER'],
    ['/create-tournament', 'ORGANIZER'],
    ['/dashboard/judge', 'JUDGE'],
    ['/dashboard/debater', 'DEBATER'],
    ['/notifications', 'DEBATER'],
  ])('%s is allowed for a %s', (path, role) => {
    renderAt(path, role);
    expect(screen.getByTestId('path')).toHaveTextContent(path);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('unknown URLs fall back to the home page', () => {
    renderAt('/this/does/not/exist');
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });
});
