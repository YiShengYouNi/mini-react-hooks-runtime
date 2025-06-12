

import { renderWithHooks } from './react';

export function render(Component: Function) {
  const fiber = { memoizedState: null };

  function run() {
    renderWithHooks(fiber, Component);
    console.log('🔍 Fiber State:', JSON.stringify(fiber.memoizedState, null, 2));
  }

  globalThis.__RE_RENDER__ = run;

  run();
}