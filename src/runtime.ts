

import { renderWithHooks, commitEffects, Fiber } from './react';
import { cloneEffectList } from './utils';


let currentFiber: Fiber | null = null;

export function render(Component: Function) {
  // 构建当前render的 Fiber
  const workInProgressFiber: Fiber = {
    memoizedState: null,
    alternate: currentFiber, // 👈 挂载上次的 Fiber
  };
  // const fiber = { memoizedState: null };

  function run() {
    renderWithHooks(workInProgressFiber, Component);
    commitEffects(workInProgressFiber); // 🧠 在 render 后执行副作用

    // 🆕 手动复制 effect 链到 alternate
    if (!workInProgressFiber.alternate) {
      workInProgressFiber.alternate = {
        memoizedState: null,
      };
    }
    workInProgressFiber.alternate.updateQueue = cloneEffectList(workInProgressFiber.updateQueue!);
    // console.log('🔍 Fiber:', JSON.stringify(workInProgressFiber, null, 2));
    currentFiber = workInProgressFiber; // 👈 提交本轮 fiber
  }

  globalThis.__RE_RENDER__ = run;

  run();
}