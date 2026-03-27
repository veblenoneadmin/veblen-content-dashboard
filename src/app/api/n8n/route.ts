import { NextRequest, NextResponse } from 'next/server';

const N8N_URL    = (process.env.N8N_URL ?? '').replace(/\/$/, '');
const N8N_KEY    = process.env.N8N_API_KEY ?? '';
const headers    = { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' };

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
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
