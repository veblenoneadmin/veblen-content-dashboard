import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? 'veblen-internal';
const headers = { 'x-internal-key': INTERNAL_KEY, 'Content-Type': 'application/json' };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/competitors/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND}/api/competitors/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 404 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
