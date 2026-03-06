import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from '../useTheme';

beforeEach(() => {
  localStorage.clear();
  useThemeStore.setState({ theme: 'system' });
  document.documentElement.classList.remove('dark');
});

describe('useThemeStore', () => {
  it('initializes with system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('setTheme updates state', () => {
    act(() => {
      useThemeStore.getState().setTheme('dark');
    });
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme saves to localStorage', () => {
    act(() => {
      useThemeStore.getState().setTheme('light');
    });
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('cycles through themes', () => {
    const { setTheme } = useThemeStore.getState();

    act(() => setTheme('light'));
    expect(useThemeStore.getState().theme).toBe('light');

    act(() => setTheme('dark'));
    expect(useThemeStore.getState().theme).toBe('dark');

    act(() => setTheme('system'));
    expect(useThemeStore.getState().theme).toBe('system');
  });
});
