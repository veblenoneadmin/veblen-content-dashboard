import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? 'veblen-internal';

const internalHeaders = { 'x-internal-key': INTERNAL_KEY };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND}/api/articles/${id}`, { headers: internalHeaders });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 404 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND}/api/articles/${id}`, {
      method: 'DELETE',
      headers: internalHeaders,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 404 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
