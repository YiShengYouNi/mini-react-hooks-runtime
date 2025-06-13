import { Effect, UpdateQueue } from './react';

export function cloneEffectList(updateQueue: UpdateQueue): UpdateQueue {
  if (!updateQueue.lastEffect) return { lastEffect: null };

  let first = updateQueue.lastEffect.next!;
  let oldEffect = first;

  const newFirst: Effect = {
    tag: oldEffect.tag,
    create: oldEffect.create,
    destroy: oldEffect.destroy,
    deps: oldEffect.deps,
    next: null!,
  };

  let prevNewEffect = newFirst;
  oldEffect = oldEffect.next!;

  while (oldEffect !== first) {
    const newEffect: Effect = {
      tag: oldEffect.tag,
      create: oldEffect.create,
      destroy: oldEffect.destroy,
      deps: oldEffect.deps,
      next: null!,
    };
    prevNewEffect.next = newEffect;
    prevNewEffect = newEffect;
    oldEffect = oldEffect.next!;
  }

  // 闭环
  prevNewEffect.next = newFirst;

  return { lastEffect: prevNewEffect };
}