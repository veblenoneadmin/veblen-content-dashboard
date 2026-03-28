import { NextRequest, NextResponse } from 'next/server';

// Extract just the origin (strip any path the user may have accidentally included)
// and ensure https:// prefix is present
function parseN8nUrl(raw: string): string {
  let url = raw.replace(/[^\x20-\x7E]/g, '').trim();
  if (!url) return '';
  if (!url.startsWith('http')) url = 'https://' + url;
  try { return new URL(url).origin; } catch { return url.replace(/\/.*$/, ''); }
}

const N8N_URL = parseN8nUrl(process.env.N8N_URL ?? '');
const N8N_KEY = (process.env.N8N_API_KEY ?? '').replace(/[^\x20-\x7E]/g, '').trim();
const headers = { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' };

async function n8nGet(path: string) {
  const res = await fetch(`${N8N_URL}/api/v1${path}`, { headers, signal: AbortSignal.timeout(10000) });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

// GET /api/n8n?action=statuses
// GET /api/n8n?action=executions&id=WORKFLOW_ID
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');
  const id     = req.nextUrl.searchParams.get('id');

  if (!N8N_URL || !N8N_KEY) {
    return NextResponse.json({ error: 'N8N_URL or N8N_API_KEY not set' }, { status: 500 });
  }

  try {
    if (action === 'statuses') {
      // Fetch each workflow's active status
      const ids = [
        '0yJMjB9HTHMx8xCa','NILI1T4BF1mOJRPS','dwxqwzab0DJN6ua8',
        '8S2eNGnN0iCB7b12','urEZZsV9Q0pnCoKJ','JgvzFoeHnnNHdBkx',
        'g0OB6q4LxsnwwX2m','pkYR4WGWEgKATu6q','3IHsFm5SyqCWmM5X',
      ];
      const results = await Promise.all(
        ids.map(async (wfId) => {
          try {
            const r = await n8nGet(`/workflows/${wfId}`);
            return { id: wfId, active: r.data?.active ?? null, ok: r.ok };
          } catch {
            return { id: wfId, active: null, ok: false };
          }
        })
      );
      return NextResponse.json(results);
    }

    if (action === 'executions' && id) {
      const r = await n8nGet(`/executions?workflowId=${id}&limit=5`);
      return NextResponse.json(r.data?.data ?? []);
    }

    // Debug: show what env vars are loaded (safe — key is masked)
    if (action === 'debug') {
      return NextResponse.json({
        url: N8N_URL || '(not set)',
        keyLength: N8N_KEY.length,
        keyPrefix: N8N_KEY ? N8N_KEY.slice(0, 10) + '...' : '(not set)',
      });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/n8n  { action: 'trigger', id: WORKFLOW_ID }
export async function POST(req: NextRequest) {
  if (!N8N_URL || !N8N_KEY) {
    return NextResponse.json({ error: 'N8N_URL or N8N_API_KEY not set' }, { status: 500 });
  }
  try {
    const { action, id } = await req.json();
    if (action === 'trigger' && id) {
      const res = await fetch(`${N8N_URL}/api/v1/workflows/${id}/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: res.ok, status: res.status, data });
    }

    if ((action === 'activate' || action === 'deactivate') && id) {
      const res = await fetch(`${N8N_URL}/api/v1/workflows/${id}/${action}`, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        ok: res.ok,
        active: data?.active ?? null,
        error: res.ok ? null : (data?.message ?? 'Failed to update workflow'),
      });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
