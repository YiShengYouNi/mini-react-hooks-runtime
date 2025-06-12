import { prepareToRender } from './react';

export function scheduleUpdate() {
  console.log('\n🌀 Trigger re-render...');
  render(currentComponent);
}

let currentComponent: Function;

export function render(Component: Function) {
  const fiber = {
    memoizedState: null,
  };

  prepareToRender(fiber);
  currentComponent = Component;

  globalThis.__RE_RENDER__ = () => render(Component);

  Component(); // 执行组件函数

  console.log('🔍 Fiber State:', JSON.stringify(fiber, null, 2));
}
