export type FeatureStatus = 'planned' | 'available';

export function featurePagePath(feature: string): string {
  return `docs/product/features/${feature}.md`;
}

export function decisionPagePath(feature: string): string {
  return `docs/dev/decisions/${feature}.md`;
}

/** True only when tasks.md has at least one task and every task is checked. */
export function allTasksDone(tasksMd: string): boolean {
  const tasks = tasksMd.match(/^- \[[ xX]\] /gm) ?? [];
  if (tasks.length === 0) return false;
  return !tasks.some((line) => line.startsWith('- [ ]'));
}

/** Status only moves from planned to available, and only when every task is done. */
export function nextStatus(current: FeatureStatus, tasksDone: boolean): FeatureStatus {
  if (current === 'available') return 'available';
  return tasksDone ? 'available' : 'planned';
}
