'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, Competitor, NewsItem, NewsSourceConfig } from './types';
import { samplePosts, sampleCompetitors, sampleNews } from './data';

type Theme = 'veblen' | 'vscode';

interface DashboardContextType {
  posts: Post[];
  competitors: Competitor[];
  newsItems: NewsItem[];
  newsSourceConfigs: NewsSourceConfig[];
  newsSources: string[]; // derived — names only, for tab filtering
  theme: Theme;
  toggleTheme: () => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  addNewsSourceConfig: (config: NewsSourceConfig) => void;
  removeNewsSource: (name: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const defaultSources: NewsSourceConfig[] = [
  { id: 'reddit',    name: 'Reddit',    type: 'url' },
  { id: 'rss',       name: 'RSS',       type: 'url' },
  { id: 'localllama',name: 'LocalLLaMA',type: 'url' },
];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [competitors] = useState<Competitor[]>(sampleCompetitors);
  const [newsItems] = useState<NewsItem[]>(sampleNews);
  const [newsSourceConfigs, setNewsSourceConfigs] = useState<NewsSourceConfig[]>(defaultSources);
  const [theme, setTheme] = useState<Theme>('vscode');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'vscode' ? 'vscode' : '');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'veblen' ? 'vscode' : 'veblen'));

  const addNewsSourceConfig = (config: NewsSourceConfig) => {
    setNewsSourceConfigs(prev => {
      if (prev.some(s => s.name === config.name)) return prev;
      return [...prev, config];
    });
  };

  const removeNewsSource = (name: string) => {
    setNewsSourceConfigs(prev => prev.filter(s => s.name !== name));
  };

  const addPost = (postData: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = { ...postData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setPosts(prev => [newPost, ...prev]);
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => post.id === id ? { ...post, ...updates } : post));
  };

  const newsSources = newsSourceConfigs.map(c => c.name);

  return (
    <DashboardContext.Provider value={{ posts, competitors, newsItems, newsSourceConfigs, newsSources, theme, toggleTheme, addPost, updatePost, addNewsSourceConfig, removeNewsSource }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}
