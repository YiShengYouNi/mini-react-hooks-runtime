// 模拟 Hook 节点
type Hook = {
  memoizedState: any; // 当前 Hook 的状态值
  queue: any; // 当前 Hook 的更新队
  next: Hook | null; // 下一个 Hook 节
};
// 每个 Hook 都是一个节点，用链表的形式串联在组件对应的 Fiber 节点上

let isMount = true; // 是否是首次渲染

let currentlyRenderingFiber: {
  memoizedState: Hook | null;
} | null = null;

// 协助构建 hook 链表的关键参数
let workInProgressHook: Hook | null = null;

export type Fiber = {
  memoizedState: Hook | null;
};

// 模拟 useState hook
// initialState: 初始状态
// 返回值: [state, dispatch]
// dispatch: (prevState) => newState
export function useState(initialState: any) {
  const hook = mountWorkInProgressHook(); // 初始化 hook 节点

  if (!hook.queue) { // 如果当前 hook 没有队列，则初始化状态和队
    hook.memoizedState = initialState;
    hook.queue = {
      pending: null as null | ((prev: any) => any),
    };
  }

  const dispatch = (action: (prev: any) => any) => {
    hook.queue.pending = action;
    scheduleUpdate(); // 调度更新
  };

  if (hook.queue.pending) {
    hook.memoizedState = hook.queue.pending(hook.memoizedState);
    hook.queue.pending = null;
  }
  console.log('[🔧1 mount hook]', JSON.stringify(currentlyRenderingFiber?.memoizedState, null, 2));
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
  console.log('[🔧 2 mount hook]', JSON.stringify(currentlyRenderingFiber?.memoizedState, null, 2));

  return [hook.memoizedState, dispatch] as const;
}
// hook 链表管理
function mountWorkInProgressHook(): Hook {
  // 当前没有正在渲染的 Fiber 节点
  if (!currentlyRenderingFiber) throw new Error("No fiber rendering now");
  // 
  if (isMount) { // 初始次挂载
    const hook: Hook = {
      memoizedState: null,
      queue: null,
      next: null,
    };
    // 如果当前 Fiber 节点没有 memoizedState，则说明是第一个 Hoo
    if (!currentlyRenderingFiber.memoizedState) {
      currentlyRenderingFiber.memoizedState = hook;
    } else {
      workInProgressHook!.next = hook; // 推进 workInProgressHook 链
    }
    workInProgressHook = hook;
  } else {
    // 更新时：复用旧的 Hook
    if (!workInProgressHook) {
      if (!currentlyRenderingFiber.memoizedState) {
        throw new Error("No existing hooks to replay from");
      }
      workInProgressHook = currentlyRenderingFiber.memoizedState;
    } else {
      if (!workInProgressHook.next) {
        throw new Error("Hook chain is broken");
      }
      workInProgressHook = workInProgressHook.next!;
    }
  }
  console.log('🔗 Hook:', workInProgressHook);
  return workInProgressHook;
}

export function prepareToRender(fiber: { memoizedState: Hook | null }) {
  currentlyRenderingFiber = fiber;
  workInProgressHook = fiber.memoizedState;
  isMount = fiber.memoizedState === null;
}

function scheduleUpdate() {
  console.log('\n🌀 Trigger re-render...');
  if (typeof globalThis.__RE_RENDER__ === 'function') {
    globalThis.__RE_RENDER__();
  }
}
