import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './SignupPage';
import RoleSelectionPage from './RoleSelectionPage';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { useToast } from '../../components/common/Toast';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../api', () => ({ authAPI: { signup: vi.fn() }, usersAPI: { uploadProfilePicture: vi.fn() } }));
vi.mock('../../components/common/Toast', () => ({ useToast: vi.fn() }));

const login = vi.fn();
const setSelectedRole = vi.fn();
const showToast = vi.fn();

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/role-select" element={<RoleSelectionPage />} />
        <Route path="/login" element={<div data-testid="login-page" />} />
        <Route path="/dashboard/:role" element={<div data-testid="dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

function fillSignup(password: string, confirm: string) {
  const type = (placeholder: string, value: string) =>
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  type('Your full name', 'New Judge');
  type('username', 'newjudge');
  type('your@email.com', 'newjudge@dms.com');
  type('Enter password', password);
  type('Confirm password', confirm);
}

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login, setSelectedRole, selectedRole: 'JUDGE' });
  (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ showToast });
});

describe('SignupPage', () => {
  it('rejects mismatched passwords before calling the API', () => {
    renderAt('/signup');
    fillSignup('password123', 'password124');
    fireEvent.submit(screen.getByPlaceholderText('Enter password').closest('form')!);

    expect(showToast).toHaveBeenCalledWith('Passwords do not match', 'error');
    expect(authAPI.signup).not.toHaveBeenCalled();
  });

  it('rejects passwords shorter than 6 characters', () => {
    renderAt('/signup');
    fillSignup('abc', 'abc');
    fireEvent.submit(screen.getByPlaceholderText('Enter password').closest('form')!);

    expect(showToast).toHaveBeenCalledWith('Password must be at least 6 characters', 'error');
    expect(authAPI.signup).not.toHaveBeenCalled();
  });

  it('shows judge-only fields when the JUDGE role is selected', () => {
    renderAt('/signup');
    expect(screen.getByPlaceholderText('e.g. Asian Parliamentary')).toBeInTheDocument();
  });

  it('creates the account with the selected role and opens the dashboard', async () => {
    (authAPI.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { token: 'JWT', user: { id: 5, username: 'newjudge', role: 'JUDGE' } },
    });
    renderAt('/signup');
    fillSignup('password123', 'password123');
    fireEvent.submit(screen.getByPlaceholderText('Enter password').closest('form')!);

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    expect(authAPI.signup).toHaveBeenCalledWith(expect.objectContaining({
      username: 'newjudge', email: 'newjudge@dms.com', role: 'JUDGE', password: 'password123',
    }));
    expect(login).toHaveBeenCalledWith('JWT', expect.objectContaining({ id: 5 }));
  });

  it('shows the server error when the username is taken', async () => {
    (authAPI.signup as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { error: 'Username already taken' } },
    });
    renderAt('/signup');
    fillSignup('password123', 'password123');
    fireEvent.submit(screen.getByPlaceholderText('Enter password').closest('form')!);

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Username already taken', 'error'));
  });
});

describe('RoleSelectionPage', () => {
  it.each(['Debater', 'Judge', 'Organizer'])('choosing %s remembers the role and goes to login', (title) => {
    renderAt('/role-select');
    fireEvent.click(screen.getByRole('heading', { name: title }).closest('button')!);

    expect(setSelectedRole).toHaveBeenCalledWith(title.toUpperCase());
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
