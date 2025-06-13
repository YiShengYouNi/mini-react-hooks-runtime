

import { renderWithHooks, commitEffects } from './react';

export function render(Component: Function) {
  const fiber = { memoizedState: null };

  function run() {
    renderWithHooks(fiber, Component);
    commitEffects(fiber); // 🧠 在 render 后执行副作用
    console.log('🔍 Fiber State:', JSON.stringify(fiber.memoizedState, null, 2));
  }

  globalThis.__RE_RENDER__ = run;

  run();
}