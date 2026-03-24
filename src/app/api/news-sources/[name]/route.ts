import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function DELETE(_req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const res = await fetch(`${BACKEND}/api/news-sources/${encodeURIComponent(params.name)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
