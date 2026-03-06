import { api, apiUpload } from '../api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('api', () => {
  it('calls fetch with correct URL and headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const result = await api('/users');
    expect(result).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('includes auth token when present', async () => {
    localStorage.setItem('accessToken', 'test-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await api('/users');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('appends query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await api('/posts', { params: { page: 1, limit: 20 } });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('limit=20');
  });

  it('skips undefined params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await api('/posts', { params: { page: 1, category: undefined } });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).not.toContain('category');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    await expect(api('/users')).rejects.toThrow('Bad request');
  });

  it('refreshes token on 401', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ accessToken: 'new-token', refreshToken: 'new-refresh' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'refreshed' }),
      });

    const result = await api('/users');
    expect(result).toEqual({ data: 'refreshed' });
    expect(localStorage.getItem('accessToken')).toBe('new-token');
  });

  it('handles failed JSON parse on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    });

    await expect(api('/users')).rejects.toThrow('Request failed');
  });
});

describe('apiUpload', () => {
  it('sends FormData without Content-Type header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: 'https://example.com/image.jpg' }),
    });

    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.jpg');

    const result = await apiUpload('/upload', formData);
    expect(result).toEqual({ url: 'https://example.com/image.jpg' });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('includes auth token', async () => {
    localStorage.setItem('accessToken', 'my-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiUpload('/upload', new FormData());
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer my-token');
  });

  it('throws on upload failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Upload failed' }),
    });

    await expect(apiUpload('/upload', new FormData())).rejects.toThrow('Upload failed');
  });
});
