export function defer(fn: () => void, defered = true) {
  if (defered) {
    setTimeout(() => fn(), 1);
  } else {
    fn();
  }
}
