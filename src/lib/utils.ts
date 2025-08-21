export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};
