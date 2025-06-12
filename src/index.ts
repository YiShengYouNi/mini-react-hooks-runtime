import { useState, useReducer } from './react';
import { render } from './runtime';

function reducer(state: number, action: string) {
  switch (action) {
    case 'inc': return state + 1;
    case 'dec': return state - 1;
    default: return state;
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [total, dispatch] = useReducer(reducer, 100);

  console.log('👀 Render: count =', count, ', total =', total);

  globalThis.setCount = setCount;
  globalThis.dispatch = dispatch;
}

render(App);

setTimeout(() => setCount((prev: number) => prev + 1), 1000);
setTimeout(() => dispatch('dec'), 2000);
