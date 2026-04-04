import { NextRequest, NextResponse } from 'next/server';

// YouTube Data API v3 upload endpoint
// Requires OAuth2 credentials — configured via YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN

interface UploadPayload {
  title: string;
  description: string;
  tags: string[];
  privacy?: 'private' | 'unlisted' | 'public';
  categoryId?: string; // YouTube category (22 = People & Blogs, 28 = Science & Tech)
}

const CATEGORY_MAP: Record<string, string> = {
  tech: '28',       // Science & Technology
  gaming: '20',     // Gaming
  finance: '22',    // People & Blogs
  cooking: '26',    // Howto & Style
  fitness: '17',    // Sports
  science: '28',    // Science & Technology
  motivation: '22', // People & Blogs
  travel: '19',     // Travel & Events
  true_crime: '22', // People & Blogs
  general: '22',    // People & Blogs
};

async function getAccessToken(): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YouTube OAuth credentials not configured. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in .env.local');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh YouTube token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── Check OAuth status ──────────────────────────────
    if (action === 'status') {
      const hasCredentials = !!(
        process.env.YOUTUBE_CLIENT_ID &&
        process.env.YOUTUBE_CLIENT_SECRET &&
        process.env.YOUTUBE_REFRESH_TOKEN
      );

      let channelInfo = null;
      if (hasCredentials) {
        try {
          const token = await getAccessToken();
          const res = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.ok) {
            const data = await res.json();
            const ch = data.items?.[0];
            if (ch) {
              channelInfo = {
                id: ch.id,
                title: ch.snippet.title,
                thumbnail: ch.snippet.thumbnails?.default?.url,
              };
            }
          }
        } catch {
          // Token may be expired or invalid
        }
      }

      return NextResponse.json({
        connected: !!channelInfo,
        hasCredentials,
        channel: channelInfo,
      });
    }

    // ── Upload video ────────────────────────────────────
    if (action === 'upload') {
      const { title, description, tags, nicheId, privacy = 'private' } = body as UploadPayload & { nicheId?: string; privacy?: string };

      // In a real implementation, this would:
      // 1. Get the assembled video file from the produce stage
      // 2. Upload it to YouTube via resumable upload API
      // 3. Set captions, thumbnail, etc.
      //
      // For now, we validate and return what would happen

      const token = await getAccessToken();
      const categoryId = CATEGORY_MAP[nicheId || 'general'] || '22';

      // Verify the token works
      const channelRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!channelRes.ok) {
        return NextResponse.json({ error: 'YouTube authentication failed' }, { status: 401 });
      }

      const channelData = await channelRes.json();
      const channel = channelData.items?.[0];

      return NextResponse.json({
        status: 'ready_to_upload',
        channel: {
          id: channel?.id,
          title: channel?.snippet?.title,
        },
        videoMetadata: {
          title,
          description,
          tags,
          categoryId,
          privacy,
          defaultLanguage: 'en',
        },
        message: 'Video metadata validated. Upload will proceed once video assembly is complete.',
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
