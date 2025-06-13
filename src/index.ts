import { useState, useReducer, useEffect } from './react';
import { render } from './runtime';

function reducer(state: number, action: string) {
  return action === 'inc' ? state + 1 : state - 1;
}

function App() {
  const [count, setCount] = useState(0);
  const [total, dispatch] = useReducer(reducer, 100);

  useEffect(() => {
    console.log('🔥[Effect] count is', count);
    return () => {
      console.log('🧹[Cleanup] count was', count);
    };
  }, [count]);

  console.log('👀 Render: count =', count, ', total =', total);

  globalThis.setCount = setCount;
  globalThis.dispatch = dispatch;
}

render(App);
// console.log('⏳ Waiting to update count...');
// setTimeout(() => setCount!((prev: number) => prev + 1), 1000);
// setTimeout(() => dispatch!('dec'), 2000);

// 验证useEffect的效果
setTimeout(() => setCount((prev) => prev + 1), 1000);
setTimeout(() => setCount((prev) => prev + 1), 2000);

