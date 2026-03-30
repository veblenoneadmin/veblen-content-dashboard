import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const name = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (name.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      return NextResponse.json({ text: text.trim() });
    }

    if (name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text.trim() });
    }

    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value.trim() });
    }

    return NextResponse.json({ error: 'Unsupported file type. Use .txt, .pdf, or .docx' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parse failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
