export type Fiber = {
  memoizedState: Hook | null;
  updateQueue?: UpdateQueue; // 用于保存当前组件注册的所有 effect
  alternate?: Fiber | null; // 👈 上一次渲染的 fiber
};

export type UpdateQueue = {
  lastEffect: Effect | null;             // 指向 Effect 环状链表的最后一个节点（首节点为 lastEffect.next）
};

type Hook = {
  memoizedState: any;
  queue: { pending: any } | null;
  next: Hook | null;
  dispatch?: (action: any) => void;
};

export type Effect = {
  tag: 'effect' | 'layout' | 'passive'; // 用于标记 effect 的类型
  create: () => void | (() => void);
  destroy?: () => void;
  deps: any[] | null;
  next: Effect | null;
};

export


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
  const fiber = currentlyRenderingFiber!;
  if (!fiber.updateQueue) fiber.updateQueue = { lastEffect: null };
  // 从 alternate fiber 获取上一次 effect
  const prevFiber = fiber.alternate
  const prevLastEffect = prevFiber?.updateQueue?.lastEffect;

  let destroy: (() => void) | undefined = undefined;
  console.log('🔍 [prevLastEffect]:', prevLastEffect);
  if (prevLastEffect) {
    let prevEffect = prevLastEffect.next!; // 获取上一次 effect 链表的首节点
    console.log('[🔍 prevEffect chain]', JSON.stringify(prevEffect, null, 2));
    do {
      const isSameDeps =
        deps &&
        prevEffect.deps &&
        deps.length === prevEffect.deps.length &&
        deps.every((dep, i) => Object.is(dep, prevEffect.deps![i]));

      if (isSameDeps) {
        destroy = prevEffect.destroy;
        console.log('🧬 [Effect matched & reused destroy]');
        break;
      }
      prevEffect = prevEffect.next!;
    } while (prevEffect !== prevLastEffect.next);
  }

  const effect: Effect = {
    tag: 'effect',
    create,
    destroy, // 如果有上一次的 destroy 函数，则复用
    deps: deps ?? null,
    next: null,
  };


  const lastEffect = fiber.updateQueue.lastEffect;
  if (lastEffect === null) {
    effect.next = effect;
  } else {
    effect.next = lastEffect.next;
    lastEffect.next = effect;
  }
  fiber.updateQueue.lastEffect = effect;
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
    console.log('[🧹 Cleanup Executed]：', effect.destroy);
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

