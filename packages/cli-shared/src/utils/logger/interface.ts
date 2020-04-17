export interface ISharedCLILogger {
  info: (...args: string[]) => void;
  write: (...args: string[]) => void;
  warn: (...args: string[]) => void;
  debug: (...args: string[]) => void;
  error: (err: Error, message?: string) => void;
}
