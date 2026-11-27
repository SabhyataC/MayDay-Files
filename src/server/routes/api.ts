
import { Hono } from 'hono';
import { context, reddit, redis } from '@devvit/web/server';
import type { Clue, InitResponse, VisitResponse } from '../../shared/api';
import { marigold, marigoldClues } from '../cases/marigold';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

const progressKey = () => `progress:${context.postId}:${context.userId}:areas`;

async function loadAreas(): Promise<string[]> {
  const raw = await redis.get(progressKey());
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function cluesFor(areas: string[]): Record<string, Clue[]> {
  const out: Record<string, Clue[]> = {};
  for (const id of areas) {
    const found = marigoldClues[id];
    if (found) out[id] = found;
  }
  return out;
}

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const [username, areasUsed] = await Promise.all([
      reddit.getCurrentUsername(),
      loadAreas(),
    ]);
    return c.json<InitResponse>({
      type: 'init',
      postId,
      username: username ?? 'anonymous',
      caseInfo: marigold,
      areasUsed,
      clues: cluesFor(areasUsed),
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ErrorResponse>(
      { status: 'error', message: `Initialization failed: ${message}` },
      400
    );
  }
});

api.post('/visit', async (c) => {
  const { postId, userId } = context;
  if (!postId || !userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in to investigate' },
      400
    );
  }

  const body = (await c.req.json().catch(() => ({}))) as { areaId?: string };
  const areaId = body.areaId;
  if (!areaId || !marigold.areas.some((a) => a.id === areaId)) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Unknown area' }, 400);
  }

  const areaClues = marigoldClues[areaId];
  if (!areaClues) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'This area is not ready yet' },
      404
    );
  }

  const used = await loadAreas();
  if (!used.includes(areaId)) {
    if (used.length >= marigold.maxAreas) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'No investigation actions left' },
        409
      );
    }
    used.push(areaId);
    await redis.set(progressKey(), JSON.stringify(used));
  }

  return c.json<VisitResponse>({
    type: 'visit',
    areaId,
    areasUsed: used,
    clues: areaClues,
  });
});