export { };

declare global {
  var __RE_RENDER__: (() => void) | undefined;
  var setCount: ((v: any) => void) | undefined;
  var dispatch: ((action: any) => void) | undefined;
}