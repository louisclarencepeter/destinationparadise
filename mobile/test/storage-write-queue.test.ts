import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorageWriteQueue } from '../src/state/storage-write-queue';

function pendingWrite() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

test('older failed saves cannot overwrite status for a newer queued user change', async () => {
  const first = pendingWrite();
  const second = pendingWrite();
  const written: string[] = [];
  const results: string[] = [];
  const writer = createStorageWriteQueue((value) => {
    written.push(value);
    return value === 'older trip' ? first.promise : second.promise;
  }, (result) => results.push(result));
  const oldSave = writer.enqueue('older trip');
  const newSave = writer.enqueue('newer trip');
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(written, ['older trip']);
  first.reject(new Error('Device temporarily locked'));
  await oldSave;
  assert.deepEqual(results, []);
  await Promise.resolve();
  assert.deepEqual(written, ['older trip', 'newer trip']);
  second.resolve();
  await newSave;
  assert.deepEqual(results, ['saved']);
});

test('a current write error is cleared when the newest retry succeeds', async () => {
  const results: string[] = [];
  const writer = createStorageWriteQueue(async (value) => {
    if (value === 'failure') throw new Error('Storage unavailable');
  }, (result) => results.push(result));
  await writer.enqueue('failure');
  assert.deepEqual(results, ['error']);
  await writer.enqueue('retry');
  assert.deepEqual(results, ['error', 'saved']);
});

test('older success cannot hide failure of the latest preferences', async () => {
  const first = pendingWrite();
  const results: string[] = [];
  const writer = createStorageWriteQueue(async (value) => {
    if (value === 'older trip') await first.promise;
    else throw new Error('Quota exceeded');
  }, (result) => results.push(result));
  const oldSave = writer.enqueue('older trip');
  const newSave = writer.enqueue('latest trip');
  first.resolve();
  await oldSave;
  assert.deepEqual(results, []);
  await newSave;
  assert.deepEqual(results, ['error']);
});
