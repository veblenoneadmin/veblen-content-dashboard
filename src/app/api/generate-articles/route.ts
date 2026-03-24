import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://primary-s0q-production.up.railway.app/webhook/generate-articles';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(600_000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream returned HTTP ${upstream.status}` }, { status: 502 });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
