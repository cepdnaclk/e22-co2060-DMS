import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { seedFile, signupViaApi } from './helpers';

/** Creates fresh users for this run so tests never depend on leftover data. */
export default async function globalSetup() {
  const ctx = await request.newContext();
  const runId = Date.now().toString(36);
  const seed = {
    organizer: await signupViaApi(ctx, 'org', 'ORGANIZER', runId),
    judge: await signupViaApi(ctx, 'judge', 'JUDGE', runId),
    debaterA: await signupViaApi(ctx, 'debA', 'DEBATER', runId),
    debaterB: await signupViaApi(ctx, 'debB', 'DEBATER', runId),
  };
  fs.mkdirSync(path.dirname(seedFile), { recursive: true });
  fs.writeFileSync(seedFile, JSON.stringify(seed, null, 2));
  await ctx.dispose();
}
