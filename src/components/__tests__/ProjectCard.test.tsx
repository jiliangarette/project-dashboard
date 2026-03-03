import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../ProjectCard';
import { GitHubRepo } from '@/lib/github';

const mockRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  description: 'A test repository',
  html_url: 'https://github.com/testuser/test-repo',
  language: 'TypeScript',
  stargazers_count: 42,
  forks_count: 7,
  open_issues_count: 3,
  updated_at: '2026-03-04T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  topics: ['test', 'demo'],
  homepage: null,
  private: false,
  fork: false,
  archived: false,
  disabled: false,
};

describe('ProjectCard', () => {
  it('renders repository name and description', () => {
    render(
      <ProjectCard
        repo={mockRepo}
        isPinned={false}
        onTogglePin={jest.fn()}
      />
    );

    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('A test repository')).toBeInTheDocument();
  });

  it('displays star count', () => {
    render(
      <ProjectCard
        repo={mockRepo}
        isPinned={false}
        onTogglePin={jest.fn()}
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows language when present', () => {
    render(
      <ProjectCard
        repo={mockRepo}
        isPinned={false}
        onTogglePin={jest.fn()}
      />
    );

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const repoWithoutDesc = { ...mockRepo, description: null };
    render(
      <ProjectCard
        repo={repoWithoutDesc}
        isPinned={false}
        onTogglePin={jest.fn()}
      />
    );

    expect(screen.queryByText('A test repository')).not.toBeInTheDocument();
  });
});
