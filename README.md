# 🧬 mini-react-hooks-runtime

模拟实现 React Hooks 内部机制的最简运行时框架，用于深入理解 Fiber 架构下 Hooks 链表、状态更新队列的执行流程。

## 🚀 功能支持

- ✅ useState 状态更新
- ✅ useReducer reducer 分发机制
- ✅ Hook 链表构建
- ✅ 简易 Fiber.memoizedState 管理
- ✅ 多次 setState 调度重放

## 📦 快速开始

```bash
pnpm install
pnpm tsx src/index.ts
```

## 🔍 示例运行输出

```bash
👀 Render: count = 0 , total = 100
🌀 Trigger re-render...
👀 Render: count = 1 , total = 100
🌀 Trigger re-render...
👀 Render: count = 1 , total = 99
```

## 🧠 学习目标

- React Hooks 如何在组件内构建状态链表？
- 多个 Hook 如何依赖“顺序”运行？
- Fiber 节点如何管理更新？
- 状态是如何通过 queue 触发调度的？

## 📚 后续计划

- [ ] 支持 `useEffect` 与 effectList 队列
- [ ] 加入 `useRef` / `useMemo` 支持
- [ ] Fiber 节点结构图 + 动画演示
- [ ] 支持多组件渲染
