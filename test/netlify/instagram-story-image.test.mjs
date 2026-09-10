import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('Instagram Story portable image runtime', () => {
  it('returns decodable JPEG bytes with matching length when native Sharp is unavailable', () => {
    // A fresh process is required: Sharp selects its runtime when first imported.
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
      import { readFile } from 'node:fs/promises';
      Object.defineProperty(process, 'arch', { value: 'wasm32' });
      const { default: handler } = await import('./netlify/functions/instagram-story-image.mjs');
      const { default: sharp } = await import('sharp');
      const source = '/assets/images/safaris/rhino-on-plains.webp';
      const photo = await readFile('./public' + source);
      globalThis.fetch = async (url) => {
        if (String(url) !== 'https://yournexttriptoparadise.com' + source) {
          throw new Error('Unexpected source URL');
        }
        return new Response(photo, { headers: { 'content-type': 'image/webp' } });
      };
      const query = new URLSearchParams({ src: source, card: 'rhino-on-plains' });
      const url = 'https://example.test/api/instagram-story-image?' + query;
      const response = await handler(new Request(url));
      const bytes = Buffer.from(await response.arrayBuffer());
      const decoded = await sharp(bytes).metadata();
      const head = await handler(new Request(url, { method: 'HEAD' }));
      console.log(JSON.stringify({
        status: response.status,
        type: response.headers.get('content-type'),
        length: Number(response.headers.get('content-length')),
        bytes: bytes.length,
        signature: bytes.subarray(0, 3).toString('hex'),
        format: decoded.format,
        width: decoded.width,
        height: decoded.height,
        headStatus: head.status,
        headLength: Number(head.headers.get('content-length')),
        headBodyBytes: (await head.arrayBuffer()).byteLength,
      }));
    `], { cwd: root, encoding: 'utf8', timeout: 30_000 });
    const result = JSON.parse(output);
    expect(result).toMatchObject({
      status: 200,
      type: 'image/jpeg',
      signature: 'ffd8ff',
      format: 'jpeg',
      width: 1080,
      height: 1920,
      headStatus: 200,
      headBodyBytes: 0,
    });
    expect(result.length).toBe(result.bytes);
    expect(result.headLength).toBe(result.bytes);
    expect(result.bytes).toBeLessThan(8 * 1024 * 1024);
  });
});
