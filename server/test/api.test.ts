import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { spawn } from 'node:child_process';
import path from 'node:path';

let serverProcess: any;

beforeAll(async () => {
  const serverDir = path.resolve(__dirname, '..');
  serverProcess = spawn('node', ['dist/index.js'], { cwd: serverDir, env: { ...process.env, PORT: '3456' } });
  // wait for server to start
  await new Promise((res) => setTimeout(res, 1200));
});

afterAll(() => {
  try { serverProcess.kill(); } catch {}
});

describe('API', () => {
  it('GET /api/coverage returns shape', async () => {
    const r = await request('http://localhost:3456').get('/api/coverage');
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty('years');
  });
});
