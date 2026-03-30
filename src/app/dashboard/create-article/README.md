# Create Article Page

**Route:** `/dashboard/create-article`
**File:** `src/app/dashboard/create-article/page.tsx`

---

## Overview

The Create Article page is an AI-powered article generation tool that produces BNA-style (Business News Australia) journalism from source URLs or uploaded documents. Articles are generated via Claude Opus 4.6 and automatically saved to the database.

---

## Modes

### Source URLs (Editor Mode)
Paste one or more article URLs as source material. The system scrapes each URL via the n8n pipeline (Jina AI reader) and rewrites the content in BNA style.

- Up to 5 articles can be generated in one batch
- Each article supports multiple source URLs (synthesised into one piece)
- An optional **Angle** field steers the focus of the rewrite

### By Topic (Categorical Mode)
Enter up to 3 topic descriptions. Claude generates an original BNA-style article on each topic without scraping any URL.

- Useful for trend pieces, explainers, and opinion articles
- Supports region filtering (e.g. "Queensland") via Optional Overrides

---

## File Upload

Each source input has a paperclip button that accepts `.txt`, `.pdf`, and `.docx` files.

- **Parsing is done client-side** — no server round-trip for file reading
  - `.txt` → `FileReader.text()`
  - `.pdf` → `pdfjs-dist` (browser build)
  - `.docx` → `mammoth` (browser build)
- Once parsed, the filename badge replaces the URL input
- File content is sent as `inline:<text>` to the API route
- Articles with inline sources **bypass n8n** and call the Anthropic API directly

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate-articles` | POST | Generate articles — routes to n8n (URLs) or Anthropic SDK (inline files) |
| `/api/parse-file` | POST | Server-side file parsing fallback (unused — parsing is now client-side) |
| `/api/articles` | POST | Save a generated article to the database |
| `/api/articles` | GET | Fetch saved articles (used on page load to restore recent articles) |

---

## Generation Pipeline

### URL Sources → n8n
```
Client → /api/generate-articles → n8n webhook (Railway)
                                      → Scrape nodes (Jina AI per URL)
                                      → Prompt nodes (Claude Opus 4.6)
                                      → Format Response
                                      ← { articles: [...] }
```

### Uploaded Files → Direct Anthropic
```
Client (parse file) → /api/generate-articles → Anthropic SDK (Claude Opus 4.6)
                                              ← { articles: [...] }
```

The BNA style profile is always injected from the Next.js route — n8n's default `styleProfile` is overridden on every request.

---

## BNA Style Enforcement

The `BNA_STYLE_PROFILE` constant in `src/app/api/generate-articles/route.ts` defines the full style guide passed to Claude on every generation. Key rules enforced:

- **Headlines** — Company + active verb + outcome. Never starts with "The". Brand-name hook.
- **Lede** — City-based descriptor + ASX ticker on first mention. Present perfect tense. No passive voice.
- **Structure** — 9-point hard news structure. No subheadings. No bullet points. No summary conclusion.
- **Quotes** — `says` for live interviews only. `said`/`wrote` for all historical/written/published sources.
- **Numbers** — `$49 million` in body, `$49m` in headlines. `per cent` never `%`. Foreign currency always converted to AUD in parentheses on first mention.
- **Article ending** — Must close on a quote, a financial metric, or a contextual fact. Never a reporter summary.
- **Forbidden phrases** — "underscores", "demonstrates", "represents", "This marks", "This signals" in reporter voice.

---

## Optional Overrides (inside accordion)

Both modes share these overrides, accessible by expanding "Optional overrides":

| Override | Default | Description |
|----------|---------|-------------|
| Tone | Authoritative | Authoritative / Conversational / Analytical / Punchy |
| Format | News Report | News Report / Opinion/Analysis / Explainer / Trend Piece |
| Word count | ~600 | Target length in words (200–2000) |
| Region | — | Geographic focus (e.g. Queensland) |

By Topic mode also includes a **Source Whitelist** accordion to restrict which domains n8n scrapes.

---

## Preview Modes

After generation, the right panel shows the article in three tabs:

| Tab | Description |
|-----|-------------|
| Preview | BNA website mock — styled like businessnewsaustralia.com |
| Raw | Plain markdown output from Claude |
| Style Guide | Collapsible BNA style reference panel |

The Preview strips everything from `## Headline Variants` onwards so only the article body is shown.

---

## Image Handling

The BNA preview includes a 16:9 image placeholder above the article body. Editors can:

- **Click** to open a URL input bar
- **Drag and drop** an image file or URL onto the placeholder
- **Upload** a file via the upload button in the URL bar
- **Remove** via the × button on the top-right of the image

Images are stored in component state only — they are not saved to the database.

---

## Auto-Save Behaviour

Articles are automatically saved to the database immediately after generation. On page load, the 10 most recent saved articles are restored into the results panel. The manual Save button still exists for explicit saves.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for file uploads) | Used when articles are generated directly via Anthropic SDK |
| `BACKEND_URL` | Yes | Backend URL for saving/fetching articles (default: `http://localhost:3001`) |

The n8n webhook URL is hardcoded in `route.ts` as the Railway deployment URL.
