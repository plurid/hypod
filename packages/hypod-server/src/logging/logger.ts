import type { LogLevel } from '../config/config';

export type LogValue = string | number | boolean | null | LogValue[] | { [key: string]: LogValue };
export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

export interface LoggerOptions {
  level: LogLevel;
  write?: (line: string) => void;
  clock?: () => Date;
  base?: LogFields;
}

const priorities: Record<Exclude<LogLevel, 'silent'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const sensitive = /authorization|cookie|key|password|secret|token/i;

const sanitize = (value: unknown, key = '', seen = new WeakSet<object>()): LogValue => {
  if (sensitive.test(key)) return '[REDACTED]';
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value);
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) return value.map((item) => sanitize(item, key, seen));
  if (typeof value === 'object') {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitize(entryValue, entryKey, seen),
      ]),
    );
  }
  if (value === undefined) return '[undefined]';
  if (typeof value === 'symbol') return value.description ?? '[symbol]';
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  return '[unsupported]';
};

const sanitizeFields = (fields: LogFields): Record<string, LogValue> =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, sanitize(value, key)]));

class JsonLogger implements Logger {
  readonly #level: LogLevel;
  readonly #write: (line: string) => void;
  readonly #clock: () => Date;
  readonly #base: LogFields;

  public constructor(options: LoggerOptions) {
    this.#level = options.level;
    this.#write = options.write ?? ((line) => process.stdout.write(`${line}\n`));
    this.#clock = options.clock ?? (() => new Date());
    this.#base = options.base ?? {};
  }

  public debug(message: string, fields?: LogFields): void {
    this.#log('debug', message, fields);
  }

  public info(message: string, fields?: LogFields): void {
    this.#log('info', message, fields);
  }

  public warn(message: string, fields?: LogFields): void {
    this.#log('warn', message, fields);
  }

  public error(message: string, fields?: LogFields): void {
    this.#log('error', message, fields);
  }

  public child(fields: LogFields): Logger {
    return new JsonLogger({
      level: this.#level,
      write: this.#write,
      clock: this.#clock,
      base: { ...this.#base, ...fields },
    });
  }

  #log(level: Exclude<LogLevel, 'silent'>, message: string, fields?: LogFields): void {
    if (this.#level === 'silent' || priorities[level] < priorities[this.#level]) return;
    this.#write(
      JSON.stringify({
        timestamp: this.#clock().toISOString(),
        level,
        message,
        ...sanitizeFields({ ...this.#base, ...fields }),
      }),
    );
  }
}

export const createLogger = (options: LoggerOptions): Logger => new JsonLogger(options);
