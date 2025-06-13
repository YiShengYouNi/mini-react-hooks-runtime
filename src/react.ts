type Fiber = {
  memoizedState: Hook | null;
  updateQueue?: {
    lastEffect: Effect | null; // 环状链表的尾节点（last.next 指向首节点）
  }; // 用于保存当前组件注册的所有 effect
};

type Hook = {
  memoizedState: any;
  queue: { pending: any } | null;
  next: Hook | null;
  dispatch?: (action: any) => void;
};

type Effect = {
  tag: 'effect' | 'layout' | 'passive'; // 用于标记 effect 的类型
  create: () => void | (() => void);
  destroy?: () => void;
  deps: any[] | null;
  next: Effect | null;
};



let isMount = true;
let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: Fiber = { memoizedState: null, };
let effectList: Effect | null = null;



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

// 模拟 useEffect
export function useEffect(create: () => void | (() => void), deps?: any[]) {
  const hook = mountWorkInProgressHook();

  const hasChanged =
    !hook.memoizedState ||
    !deps ||
    deps.some((dep, i) => dep !== hook.memoizedState[i]);

  if (hasChanged) {
    // 注册 effect 到当前 fiber
    const fiber = currentlyRenderingFiber!;
    if (!fiber.updateQueue) fiber.updateQueue = { lastEffect: null };

    // 构建一个新的 effect 对象
    const effect: Effect = {
      tag: 'effect',
      create,
      destroy: undefined,
      deps: deps ?? null,
      next: null,
    };
    // 构建 effect 链表
    const lastEffect = fiber.updateQueue.lastEffect;
    if (lastEffect === null) {  // 如果是第一个 effect
      effect.next = effect; // 环状链表的首节点
    } else {
      effect.next = lastEffect.next; // 将新 effect 的 next 指向链表首节点
      lastEffect.next = effect; // 将上一个 effect 的 next 指向新 effect
    }
    // 更新 lastEffect
    fiber.updateQueue.lastEffect = effect;
  }

  // 保存 deps
  hook.memoizedState = deps ?? null;
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

export function commitEffects(fiber: Fiber) {
  console.log('🚦 Committing effect list...');
  const updateQueue = fiber.updateQueue;

  if (!updateQueue || !updateQueue.lastEffect) return;

  let firstEffect = updateQueue.lastEffect.next!; // 获取第一个 effect
  let effect = firstEffect; // 从第一个 effect 开始处理
  do {
    console.log('[🧹 Cleanup Executed]');
    effect.destroy?.(); // 清理上次副作用
    const cleanup = effect.create(); // 执行副作用创建函数
    if (typeof cleanup === 'function') {
      effect.destroy = cleanup; // 如果返回了清理函数，保存到 effect 中
    } else {
      effect.destroy = undefined; // 否则清理函数置为 undefined
    }
    // console.log('🔧 Committed effect:', effect);
    effect = effect.next!; // 获取下一个 effect
  } while (effect !== firstEffect); // 循环直到回到首节点
  // ✅ 清空队列，防止重复执行 （不考率双fiber树的切换）
  if (fiber.updateQueue) {
    fiber.updateQueue.lastEffect = null;
  }
}
