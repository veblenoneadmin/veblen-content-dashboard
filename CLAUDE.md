# Veblen Group — Content Management Dashboard

## Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript)
- **Styling**: Tailwind CSS v4 + inline styles for custom colors
- **UI Components**: shadcn/ui (button, input, textarea, select, dialog, badge)
- **Charts**: Recharts (BarChart, AreaChart with ResponsiveContainer)
- **Icons**: lucide-react
- **Fonts**: Playfair Display (serif headings), DM Sans (body text) via @fontsource packages
- **State**: React Context API (no external state library)

## Folder Structure

```
src/
  app/
    layout.tsx                  # Root layout — imports fonts, wraps in DashboardProvider
    page.tsx                    # Redirects to /dashboard/home
    globals.css                 # Font imports, CSS custom properties, base styles
    dashboard/
      layout.tsx                # Sidebar (200px) + main content flex layout
      home/page.tsx             # Overview dashboard
      instagram/page.tsx        # Instagram content manager with modal
      analytics/page.tsx        # Analytics with Recharts charts
      calendar/page.tsx         # Monthly calendar view
      competitors/page.tsx      # Competitor tracker (cards + table view)
      news/page.tsx             # Industry news feed with search/filter
      youtube/page.tsx          # Placeholder
      linkedin/page.tsx         # Placeholder
      topics/page.tsx           # Placeholder
      formats/page.tsx          # Placeholder
  components/
    sidebar/Sidebar.tsx         # Navigation sidebar with grouped nav items
    shared/
      StatusChip.tsx            # Colored status badge using STATUS_COLORS
      TypeChip.tsx              # Grey post type badge
  lib/
    types.ts                    # TypeScript interfaces (Post, Competitor, NewsItem, etc.)
    constants.ts                # STATUS_COLORS, PLATFORM_COLORS, POST_STATUSES, etc.
    data.ts                     # Sample data (posts, competitors, news, chart data)
    store.tsx                   # React Context: DashboardProvider + useDashboard hook
```

## Color System

All custom colors are defined as CSS variables in `globals.css` and applied inline:

| Variable         | Hex       | Use                              |
|-----------------|-----------|----------------------------------|
| `--bg-primary`  | `#111111` | Page background                  |
| `--bg-card`     | `#1A1A1A` | Card backgrounds                 |
| `--bg-sidebar`  | `#141414` | Sidebar background               |
| `--border`      | `#262626` | All borders                      |
| `--copper`      | `#D4845A` | Primary accent (CTAs, highlights)|
| `--copper-light`| `#E8A87C` | Secondary accent                 |

### Using STATUS_COLORS

```typescript
import { STATUS_COLORS } from '@/lib/constants';

// Get color for a status
const color = STATUS_COLORS['In Progress']; // '#D4845A'

// Chip with 13% opacity background
backgroundColor: `${color}21`  // hex with alpha
```

### Using PLATFORM_COLORS

```typescript
import { PLATFORM_COLORS } from '@/lib/constants';

const igColor = PLATFORM_COLORS['Instagram']; // '#E1306C'
```

## Status Color Reference

| Status          | Color     |
|----------------|-----------|
| In Progress    | `#D4845A` |
| Ready to Create| `#E8A87C` |
| Editing        | `#C27BA0` |
| Ready          | `#7CB8D4` |
| Scheduled      | `#85B8A0` |
| Published      | `#6AAF6A` |

## Component Conventions

### StatusChip

```tsx
import StatusChip from '@/components/shared/StatusChip';

<StatusChip status="In Progress" />
// Renders a small pill with status color at 13% opacity bg + full color text
```

### TypeChip

```tsx
import TypeChip from '@/components/shared/TypeChip';

<TypeChip type="Reel" />
// Renders a grey pill (#333 bg, #999 text)
```

### Card Pattern

Cards follow this pattern (always inline styles, not Tailwind for custom colors):

```tsx
<div style={{
  backgroundColor: '#1A1A1A',
  border: '1px solid #262626',
  borderRadius: '12px',
  padding: '20px',
}}>
  {/* content */}
</div>
```

### Button Pattern

Primary (copper):
```tsx
<button style={{
  backgroundColor: '#D4845A',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}}>
  Action
</button>
```

Secondary (dark):
```tsx
<button style={{
  backgroundColor: '#1A1A1A',
  border: '1px solid #262626',
  borderRadius: '8px',
  color: '#AAAAAA',
  padding: '7px 12px',
  fontSize: '13px',
  cursor: 'pointer',
}}>
  Action
</button>
```

## State Management

All shared state lives in `src/lib/store.tsx` using React Context.

```tsx
import { useDashboard } from '@/lib/store';

// In any client component:
const { posts, competitors, newsItems, addPost, updatePost } = useDashboard();
```

The `DashboardProvider` wraps the app in `src/app/layout.tsx`.

**Important**: All interactive components that use `useDashboard` must have the `'use client'` directive.

## Adding New Pages

1. Create the directory: `src/app/dashboard/[page-name]/`
2. Create `page.tsx` — use this placeholder template:

```tsx
export default function MyPage() {
  return (
    <div style={{ padding: '32px' }}>
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold text-white mb-2">
          Page Name
        </h1>
        <div style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #262626',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          marginTop: '32px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
          <p style={{ color: '#888888' }}>This section is coming soon</p>
        </div>
      </div>
    </div>
  );
}
```

3. Add a nav item to `src/components/sidebar/Sidebar.tsx` in the appropriate `navItems` group.

## Font Usage

- **Playfair Display** — Page titles and section headings only:
  ```tsx
  <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Title</h1>
  ```

- **DM Sans** — All body text, labels, chips (default via CSS):
  ```tsx
  // No special style needed — body font is DM Sans globally
  <p>Normal text</p>
  ```

## Sample Data Structure

Data is in `src/lib/data.ts`. The current month for all sample dates is **March 2026**.

- `samplePosts`: 8 posts across Instagram, LinkedIn, YouTube platforms
- `sampleCompetitors`: 3 competitor agencies with follower/engagement data
- `sampleNews`: 5 news items from Reddit and RSS sources
- `monthlyReachData`: 6 months (Oct 2025–Mar 2026) of reach by platform
- `engagementData`: 6 months of avg engagement rate

To add more sample posts, add entries to the `samplePosts` array following the `Post` interface in `types.ts`.

## Recharts Usage

Always wrap charts in `ResponsiveContainer`:

```tsx
import { ResponsiveContainer, BarChart, Bar } from 'recharts';

<ResponsiveContainer width="100%" height={240}>
  <BarChart data={data}>
    {/* ... */}
  </BarChart>
</ResponsiveContainer>
```

Chart styling conventions:
- Container background: `#1A1A1A`
- Grid lines: `#333333`
- Axis text: `#666666`
- Tooltip background: `#111111`, border: `#333333`
- Use copper (`#D4845A`) as primary chart color

## Sidebar Navigation

The sidebar uses `usePathname()` from `next/navigation` to detect the active route. Navigation links use Next.js `<Link>` component with full paths like `/dashboard/home`.

Active item style: `rgba(212, 132, 90, 0.13)` background + white text.
Inactive item style: `#999999` text + transparent background.
