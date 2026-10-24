import type { Client, Transaction, TransactionMode } from "@libsql/client";

/**
 * Local SQLite is accessed synchronously. If one connection holds the write lock while it awaits, another
 * connection's busy-wait blocks Node's event loop and the two deadlock until the busy timeout. Wrapping a
 * local client in this async lock queues statements and transactions instead, in order, within the process.
 * Hosted libSQL (Turso) locks on the server and is used unwrapped.
 *
 * Never use the outer client from inside one of its own transactions: that would wait on itself.
 */
export function serializeLocalClient(client: Client): Client {
  let tail: Promise<void> = Promise.resolve();
  const acquire = () => {
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    const ready = tail.then(() => release);
    tail = tail.then(() => held);
    return ready;
  };
  const exclusive = async <T>(fn: () => Promise<T>) => {
    const release = await acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  };

  const wrapTransaction = (tx: Transaction, release: () => void): Transaction => {
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        release();
      }
    };
    return new Proxy(tx, {
      get(target, prop, receiver) {
        if (prop === "commit" || prop === "rollback") {
          return async () => {
            try {
              return await target[prop]();
            } finally {
              finish();
            }
          };
        }
        if (prop === "close") {
          return () => {
            try {
              target.close();
            } finally {
              finish();
            }
          };
        }
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  };

  return new Proxy(client, {
    get(target, prop, receiver) {
      switch (prop) {
        case "execute":
        case "batch":
        case "executeMultiple":
        case "migrate":
          return (...args: unknown[]) =>
            exclusive(() => (target[prop] as (...a: unknown[]) => Promise<unknown>).apply(target, args));
        case "transaction":
          return async (mode?: TransactionMode) => {
            const release = await acquire();
            try {
              return wrapTransaction(await target.transaction(mode), release);
            } catch (e) {
              release();
              throw e;
            }
          };
        default: {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === "function" ? value.bind(target) : value;
        }
      }
    },
  });
}
