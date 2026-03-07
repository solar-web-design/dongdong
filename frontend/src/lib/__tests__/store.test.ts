import { useAuthStore } from '../store';
import type { User } from '@/types';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  role: 'MEMBER',
  status: 'ACTIVE',
  university: '서울대학교',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('useAuthStore', () => {
  it('initializes with null user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setUser sets user and isAuthenticated', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('setUser with null clears user', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('login stores user info', () => {
    useAuthStore.getState().login(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('logout clears everything', () => {
    useAuthStore.getState().login(mockUser);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
  });
});
