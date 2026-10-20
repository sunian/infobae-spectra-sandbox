import { describe, expect, it } from 'vitest';
import { allTasksDone, decisionPagePath, featurePagePath, nextStatus } from './pages';

describe('page paths', () => {
  it('builds the Product feature page path', () => {
    expect(featurePagePath('003-home-feed-article-detail')).toBe(
      'docs/product/features/003-home-feed-article-detail.md',
    );
  });

  it('builds the Developer decisions page path', () => {
    expect(decisionPagePath('003-home-feed-article-detail')).toBe(
      'docs/dev/decisions/003-home-feed-article-detail.md',
    );
  });
});

describe('nextStatus', () => {
  it('moves planned to available when all tasks are done', () => {
    expect(nextStatus('planned', true)).toBe('available');
  });

  it('keeps planned when tasks are not done', () => {
    expect(nextStatus('planned', false)).toBe('planned');
  });

  it('never goes back from available', () => {
    expect(nextStatus('available', false)).toBe('available');
    expect(nextStatus('available', true)).toBe('available');
  });
});

describe('allTasksDone', () => {
  it('is true when every task is checked', () => {
    expect(allTasksDone('- [x] T001 a\n- [X] T002 b\n')).toBe(true);
  });

  it('is false when one task is open', () => {
    expect(allTasksDone('- [x] T001 a\n- [ ] T002 b\n')).toBe(false);
  });

  it('is false when there are no tasks', () => {
    expect(allTasksDone('# Tasks\n')).toBe(false);
  });
});
