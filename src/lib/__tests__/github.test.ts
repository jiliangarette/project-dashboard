import { fetchUserRepos, fetchCommits } from '../github';

// Mock fetch globally
global.fetch = jest.fn();

describe('github.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserRepos', () => {
    it('should fetch user repositories', async () => {
      const mockRepos = [
        { id: 1, name: 'repo1', description: 'Test repo 1' },
        { id: 2, name: 'repo2', description: 'Test repo 2' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
        headers: new Headers({
          'x-ratelimit-remaining': '60',
          'x-ratelimit-reset': '1234567890',
        }),
      });

      const result = await fetchUserRepos('testuser', 'fake-token');

      expect(result.repos).toHaveLength(2);
      expect(result.repos[0].name).toBe('repo1');
      expect(result.rateLimit.remaining).toBe(60);
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchUserRepos('nonexistent', 'fake-token')).rejects.toThrow();
    });
  });

  describe('fetchCommits', () => {
    it('should fetch commits for a repository', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'Initial commit',
            author: { name: 'Test User', date: '2026-03-04T00:00:00Z' },
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommits,
      });

      const result = await fetchCommits('testuser', 'testrepo', 'fake-token');

      expect(result).toHaveLength(1);
      expect(result[0].commit.message).toBe('Initial commit');
    });
  });
});
