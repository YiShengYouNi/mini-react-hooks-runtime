type Hook = {
  memoizedState: any;
  queue: { pending: any } | null;
  next: Hook | null;
  dispatch?: (action: any) => void;
};


export let isMount = true;
export let workInProgressHook: Hook | null = null;
export let currentlyRenderingFiber: { memoizedState: Hook | null } = { memoizedState: null };
export type Fiber = {
  memoizedState: Hook | null;
};


function mountWorkInProgressHook(): Hook {
  if (!currentlyRenderingFiber) throw new Error("No fiber rendering now");

  if (isMount) {
    const hook: Hook = {
      memoizedState: null,
      queue: null,
      next: null,
    };
    if (!currentlyRenderingFiber.memoizedState) {
      currentlyRenderingFiber.memoizedState = hook;
    } else {
      workInProgressHook!.next = hook;
    }
    workInProgressHook = hook;
  } else {
    if (!workInProgressHook) {
      if (!currentlyRenderingFiber.memoizedState) throw new Error("No existing hooks to replay from");
      workInProgressHook = currentlyRenderingFiber.memoizedState;
    } else {
      if (!workInProgressHook.next) throw new Error("Hook chain is broken");
      workInProgressHook = workInProgressHook.next!;
    }
  }
  return workInProgressHook!;
}

export function useState(initialState: any) {
  const hook = mountWorkInProgressHook();

  if (!hook.queue) {
    hook.memoizedState = initialState;
    hook.queue = { pending: null };
    hook.dispatch = (action: any) => {
      hook.queue!.pending = typeof action === 'function' ? action(hook.memoizedState) : action;
      // console.log('🚀 dispatching useState', action);
      scheduleUpdate();
    };
  }

  if (hook.queue.pending !== null) {
    hook.memoizedState = hook.queue.pending;
    hook.queue.pending = null;
  }

  return [hook.memoizedState, hook.dispatch!] as const;
}

export function useReducer(reducer: Function, initialArg: any) {
  const hook = mountWorkInProgressHook();

  if (!hook.queue) {
    hook.memoizedState = initialArg;
    hook.queue = { pending: null };
    hook.dispatch = (action: any) => {
      hook.queue!.pending = action;
      // console.log('🚀 dispatching useReducer', action);
      scheduleUpdate();
    };
  }

  if (hook.queue.pending !== null) {
    hook.memoizedState = reducer(hook.memoizedState, hook.queue.pending);
    hook.queue.pending = null;
  }

  return [hook.memoizedState, hook.dispatch!] as const;
}

export function scheduleUpdate() {
  console.log('\n🌀 Trigger re-render...');
  if (typeof globalThis.__RE_RENDER__ === 'function') {
    globalThis.__RE_RENDER__();
  }
}

export function renderWithHooks(fiber: Fiber, Component: Function) {
  currentlyRenderingFiber = fiber;
  workInProgressHook = null;
  isMount = fiber.memoizedState === null;
  Component();
}