import { renderHook } from '@testing-library/react-native';

import { useNavigationLock } from './useNavigationLock';

describe('useNavigationLock', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('runs the first action', async () => {
    const { result } = await renderHook(() => useNavigationLock());
    const action = jest.fn();
    result.current(action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('ignores a second action inside the lock window', async () => {
    const { result } = await renderHook(() => useNavigationLock(600));
    const action = jest.fn();
    result.current(action);
    jest.advanceTimersByTime(599);
    result.current(action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('runs an action again after the lock window', async () => {
    const { result } = await renderHook(() => useNavigationLock(600));
    const action = jest.fn();
    result.current(action);
    jest.advanceTimersByTime(600);
    result.current(action);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('uses 600 ms by default', async () => {
    const { result } = await renderHook(() => useNavigationLock());
    const action = jest.fn();
    result.current(action);
    jest.advanceTimersByTime(599);
    result.current(action);
    expect(action).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);
    result.current(action);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
