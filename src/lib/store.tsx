'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, Competitor, NewsItem } from './types';
import { samplePosts, sampleCompetitors, sampleNews } from './data';

type Theme = 'veblen' | 'vscode';

interface DashboardContextType {
  posts: Post[];
  competitors: Competitor[];
  newsItems: NewsItem[];
  newsSources: string[];
  theme: Theme;
  toggleTheme: () => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  addNewsSource: (source: string) => void;
  removeNewsSource: (source: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [competitors] = useState<Competitor[]>(sampleCompetitors);
  const [newsItems] = useState<NewsItem[]>(sampleNews);
  const [newsSources, setNewsSources] = useState<string[]>(['Reddit', 'RSS', 'LocalLLaMA']);
  const [theme, setTheme] = useState<Theme>('vscode');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'vscode' ? 'vscode' : '');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'veblen' ? 'vscode' : 'veblen'));

  const addNewsSource = (source: string) => {
    const trimmed = source.trim();
    if (trimmed && !newsSources.includes(trimmed)) {
      setNewsSources(prev => [...prev, trimmed]);
    }
  };

  const removeNewsSource = (source: string) => {
    setNewsSources(prev => prev.filter(s => s !== source));
  };

  const addPost = (postData: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updates } : post))
    );
  };

  return (
    <DashboardContext.Provider value={{ posts, competitors, newsItems, newsSources, theme, toggleTheme, addPost, updatePost, addNewsSource, removeNewsSource }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
