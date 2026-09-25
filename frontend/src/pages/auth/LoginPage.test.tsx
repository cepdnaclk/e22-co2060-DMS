import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { useToast } from '../../components/common/Toast';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../api', () => ({ authAPI: { login: vi.fn() } }));
vi.mock('../../components/common/Toast', () => ({ useToast: vi.fn() }));

const mockLogin = vi.fn();
const showToast = vi.fn();

function renderLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/:role" element={<div data-testid="dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

function fillAndSubmit(user: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText('username or email@example.com'), { target: { value: user } });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: mockLogin, selectedRole: 'DEBATER' });
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ showToast });
  });

  it('shows the role the user selected on the previous screen', () => {
    renderLogin();
    expect(screen.getByText(/signing in as/i)).toHaveTextContent('DEBATER');
  });

  it('rejects an empty form without calling the API', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(showToast).toHaveBeenCalledWith('Please fill all required fields', 'error');
    expect(authAPI.login).not.toHaveBeenCalled();
  });

  it('shows the server error message when login fails', async () => {
    (authAPI.login as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });
    renderLogin();
    fillAndSubmit('debater1', 'wrong-password');

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Invalid credentials', 'error'));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it.each([
    ['DEBATER', '/dashboard/debater'],
    ['JUDGE', '/dashboard/judge'],
    ['ORGANIZER', '/dashboard/organizer'],
  ])('logs a %s in, stores the session and opens their dashboard', async (role) => {
    const user = { id: 1, username: 'u', role };
    (authAPI.login as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { token: 'JWT', user } });
    renderLogin();
    fillAndSubmit('u', 'password123');

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    expect(authAPI.login).toHaveBeenCalledWith({ usernameOrEmail: 'u', password: 'password123' });
    expect(mockLogin).toHaveBeenCalledWith('JWT', user);
    expect(showToast).toHaveBeenCalledWith('Login successful!', 'success');
  });

  it('toggles password visibility', () => {
    renderLogin();
    const input = screen.getByPlaceholderText('Enter your password');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(input.parentElement!.querySelector('button')!);
    expect(input).toHaveAttribute('type', 'text');
  });
});
