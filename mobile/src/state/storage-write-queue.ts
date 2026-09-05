/** Keep disk writes in user-action order and report only the newest request's result. */
export function createStorageWriteQueue(
  write: (serialized: string) => Promise<void>,
  onResult: (result: 'saved' | 'error') => void,
) {
  let latestRevision = 0;
  let queue = Promise.resolve();
  return {
    enqueue(serialized: string): Promise<void> {
      const revision = ++latestRevision;
      queue = queue.catch(() => undefined).then(async () => {
        let result: 'saved' | 'error' = 'saved';
        try { await write(serialized); } catch { result = 'error'; }
        if (revision === latestRevision) onResult(result);
      });
      return queue;
    },
  };
}
