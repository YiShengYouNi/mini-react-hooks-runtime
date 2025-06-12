import { prepareToRender, Fiber } from './react';

export function scheduleUpdate() {
  console.log('\n🌀 Trigger re-render...');
  render(currentComponent);
}

let currentComponent: Function;
let fiber: Fiber | null = null;

export function render(Component: Function) {
  if (!fiber) {
    fiber = {
      memoizedState: null, // 首次构建
    };
  }

  prepareToRender(fiber);
  currentComponent = Component;

  globalThis.__RE_RENDER__ = () => render(Component);

  Component(); // 执行组件函数

  console.log('🔍 Fiber State:', JSON.stringify(fiber, null, 2));
}
