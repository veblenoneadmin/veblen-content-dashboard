import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function GET() {
  const res = await fetch(`${BACKEND}/api/creator-posts/summary`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}
