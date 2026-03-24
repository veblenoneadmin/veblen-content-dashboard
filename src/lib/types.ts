export type Platform = 'Instagram' | 'YouTube' | 'LinkedIn' | 'Twitter/X';
export type PostStatus = 'In Progress' | 'Ready to Create' | 'Editing' | 'Ready' | 'Scheduled' | 'Published';
export type PostType = 'Reel' | 'Carousel' | 'Static' | 'Story' | 'Video' | 'Talking Head' | 'Faceless';

export interface Post {
  id: string;
  title: string;
  caption: string;
  platform: Platform;
  status: PostStatus;
  type: PostType;
  scheduledDate: string | null; // ISO date string
  createdAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  youtube: number;
  instagram: number;
  linkedin: number;
  posts: number;
  avgEngagement: number;
  trend: 'up' | 'flat' | 'down';
}

export interface NewsItem {
  id: string;
  source: string;
  subreddit?: string;
  upvotes?: number;
  title: string;
  summary: string;
  timeAgo: string;
  url?: string;
}

export interface NewsSourceConfig {
  id: string;
  name: string;
  type: 'url' | 'api' | 'webhook';
  endpoint?: string;   // RSS/JSON URL for 'url', API endpoint for 'api'
  apiKey?: string;     // bearer token / api key for 'api'
  webhookId?: string;  // generated id for 'webhook'
}

export interface MonthlyMetric {
  month: string;
  instagram: number;
  twitter: number;
  linkedin: number;
}

export interface EngagementMetric {
  month: string;
  rate: number;
}
