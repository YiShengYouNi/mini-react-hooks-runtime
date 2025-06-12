// 模拟 Hook 节点
type Hook = {
  memoizedState: any;
  queue: any;
  next: Hook | null;
};

let currentlyRenderingFiber: {
  memoizedState: Hook | null;
} | null = null;

let workInProgressHook: Hook | null = null;

// 模拟 useState hook
// initialState: 初始状态
// 返回值: [state, dispatch]
// dispatch: (prevState) => newState
export function useState(initialState: any) {
  const hook = mountWorkInProgressHook();

  if (!hook.queue) {
    hook.memoizedState = initialState;
    hook.queue = {
      pending: null as null | ((prev: any) => any),
    };
  }

  const dispatch = (action: (prev: any) => any) => {
    hook.queue.pending = action;
    scheduleUpdate();
  };

  if (hook.queue.pending) {
    hook.memoizedState = hook.queue.pending(hook.memoizedState);
    hook.queue.pending = null;
  }

  return [hook.memoizedState, dispatch] as const;
}

// 模拟 useReducer hook
// reducer: (state, action) => newState
export function useReducer(reducer: Function, initialArg: any) {
  const hook = mountWorkInProgressHook();

  if (!hook.queue) {
    hook.memoizedState = initialArg;
    hook.queue = {
      pending: null as null | any,
    };
  }

  const dispatch = (action: any) => {
    hook.queue.pending = action;
    scheduleUpdate();
  };

  if (hook.queue.pending !== null) {
    hook.memoizedState = reducer(hook.memoizedState, hook.queue.pending);
    hook.queue.pending = null;
  }

  return [hook.memoizedState, dispatch] as const;
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    queue: null,
    next: null,
  };

  if (!currentlyRenderingFiber) throw new Error("No fiber rendering now");

  if (!currentlyRenderingFiber.memoizedState) {
    currentlyRenderingFiber.memoizedState = hook;
  } else {
    workInProgressHook!.next = hook;
  }

  workInProgressHook = hook;
  return hook;
}

export function prepareToRender(fiber: { memoizedState: Hook | null }) {
  currentlyRenderingFiber = fiber;
  workInProgressHook = fiber.memoizedState;
}

function scheduleUpdate() {
  console.log('\n🌀 Trigger re-render...');
  if (typeof globalThis.__RE_RENDER__ === 'function') {
    globalThis.__RE_RENDER__();
  }
}
