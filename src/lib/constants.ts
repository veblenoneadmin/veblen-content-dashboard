export const STATUS_COLORS: Record<string, string> = {
  'In Progress': '#D4845A',
  'Ready to Create': '#E8A87C',
  'Editing': '#C27BA0',
  'Ready': '#7CB8D4',
  'Scheduled': '#85B8A0',
  'Published': '#6AAF6A',
};

export const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  YouTube: '#FF0000',
  LinkedIn: '#0A66C2',
  'Twitter/X': '#1DA1F2',
};

export const POST_STATUSES = ['In Progress', 'Ready to Create', 'Editing', 'Ready', 'Scheduled', 'Published'] as const;
export const POST_TYPES = ['Reel', 'Carousel', 'Static', 'Story', 'Video', 'Talking Head', 'Faceless'] as const;
export const PLATFORMS = ['Instagram', 'YouTube', 'LinkedIn', 'Twitter/X'] as const;
