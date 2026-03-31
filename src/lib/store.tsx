'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, Competitor, NewsItem, NewsSourceConfig } from './types';
import { samplePosts, sampleNews } from './data';

type Theme = 'veblen' | 'vscode';
export type UserRole = 'admin' | 'editor' | 'content_writer';

interface DashboardContextType {
  posts: Post[];
  competitors: Competitor[];
  newsItems: NewsItem[];
  newsSourceConfigs: NewsSourceConfig[];
  newsSources: string[]; // derived — names only, for tab filtering
  theme: Theme;
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleTheme: () => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  addNewsSourceConfig: (config: NewsSourceConfig) => void;
  removeNewsSource: (name: string) => void;
  addCompetitor: (c: Omit<Competitor, 'id'>) => Promise<void>;
  updateCompetitor: (id: string, updates: Partial<Competitor>) => Promise<void>;
  removeCompetitor: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newsItems] = useState<NewsItem[]>(sampleNews);
  const [newsSourceConfigs, setNewsSourceConfigs] = useState<NewsSourceConfig[]>([]);
  const [theme, setTheme] = useState<Theme>('vscode');
  const [role, setRoleState] = useState<UserRole>('admin');

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_role') as UserRole | null;
    if (saved && ['admin', 'editor', 'content_writer'].includes(saved)) setRoleState(saved);
  }, []);

  const setRole = (r: UserRole) => {
    setRoleState(r);
    localStorage.setItem('dashboard_role', r);
  };

  // Load news sources from DB on mount
  useEffect(() => {
    fetch('/api/news-sources')
      .then(r => r.json())
      .then((data: NewsSourceConfig[]) => {
        if (Array.isArray(data) && data.length > 0) setNewsSourceConfigs(data);
      })
      .catch(() => {/* silently keep empty */});
  }, []);

  // Load competitors from DB on mount
  useEffect(() => {
    fetch('/api/competitors')
      .then(r => r.json())
      .then((data: Competitor[]) => {
        if (Array.isArray(data) && data.length > 0) setCompetitors(data);
      })
      .catch(() => {/* silently keep empty */});
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'vscode' ? 'vscode' : '');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'veblen' ? 'vscode' : 'veblen'));

  const addNewsSourceConfig = async (config: NewsSourceConfig) => {
    setNewsSourceConfigs(prev => {
      if (prev.some(s => s.name === config.name)) return prev;
      return [...prev, config];
    });
    try {
      await fetch('/api/news-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch { /* optimistic state already applied */ }
  };

  const removeNewsSource = async (name: string) => {
    setNewsSourceConfigs(prev => prev.filter(s => s.name !== name));
    try {
      await fetch(`/api/news-sources/${encodeURIComponent(name)}`, { method: 'DELETE' });
    } catch { /* optimistic state already applied */ }
  };

  const addCompetitor = async (c: Omit<Competitor, 'id'>) => {
    const res = await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    const created = await res.json();
    if (res.ok) setCompetitors(prev => [created, ...prev]);
  };

  const updateCompetitor = async (id: string, updates: Partial<Competitor>) => {
    setCompetitors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await fetch(`/api/competitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch { /* optimistic */ }
  };

  const removeCompetitor = async (id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/competitors/${id}`, { method: 'DELETE' });
    } catch { /* optimistic */ }
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
    <DashboardContext.Provider value={{
      posts, competitors, newsItems, newsSourceConfigs, newsSources, theme, role, setRole,
      toggleTheme, addPost, updatePost, addNewsSourceConfig, removeNewsSource,
      addCompetitor, updateCompetitor, removeCompetitor,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}
