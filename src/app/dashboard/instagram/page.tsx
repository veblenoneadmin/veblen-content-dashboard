'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { POST_STATUSES, POST_TYPES } from '@/lib/constants';
import { PostStatus, PostType } from '@/lib/types';
import StatusChip from '@/components/shared/StatusChip';
import TypeChip from '@/components/shared/TypeChip';
import { CalendarDays, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function InstagramPage() {
  const { posts, addPost } = useDashboard();
  const instagramPosts = posts.filter((p) => p.platform === 'Instagram');

  const [statusFilter, setStatusFilter] = useState<PostStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<PostType | 'All Types'>('All Types');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formType, setFormType] = useState<PostType>('Reel');
  const [formStatus, setFormStatus] = useState<PostStatus>('Ready to Create');
  const [formDate, setFormDate] = useState('');

  const filtered = instagramPosts.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (typeFilter !== 'All Types' && p.type !== typeFilter) return false;
    return true;
  });

  const handleAddPost = () => {
    if (!formTitle.trim()) return;
    addPost({ title: formTitle, caption: formCaption, platform: 'Instagram', status: formStatus, type: formType, scheduledDate: formDate || null });
    setFormTitle(''); setFormCaption(''); setFormType('Reel'); setFormStatus('Ready to Create'); setFormDate('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Instagram
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>{instagramPosts.length} pieces of content</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={14} /> New
        </button>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {(['All', ...POST_STATUSES] as const).map((s) => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s as PostStatus | 'All')}
              style={{ padding: '5px 12px', borderRadius: '999px', border: '1px solid', borderColor: isActive ? 'var(--accent)' : 'var(--border)', backgroundColor: isActive ? 'var(--accent)' : 'transparent', color: isActive ? '#FFFFFF' : 'var(--text-inactive)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Type Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {(['All Types', ...POST_TYPES] as const).map((t) => {
          const isActive = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t as PostType | 'All Types')}
              style={{ padding: '5px 12px', borderRadius: '999px', border: '1px solid', borderColor: isActive ? 'var(--border-light)' : 'var(--border)', backgroundColor: isActive ? 'var(--bg-chip-type)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-faint)', fontSize: '14px' }}>
            No posts match the current filters.
          </div>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Add Post Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', maxWidth: '480px' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
              Add New Instagram Post
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Title</label>
              <input
                value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Post title..."
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Caption</label>
              <textarea
                value={formCaption} onChange={(e) => setFormCaption(e.target.value)} placeholder="Write your caption..." rows={3}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Type</label>
                <select
                  value={formType} onChange={(e) => setFormType(e.target.value as PostType)}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Status</label>
                <select
                  value={formStatus} onChange={(e) => setFormStatus(e.target.value as PostStatus)}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  {POST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Scheduled Date (optional)</label>
              <input
                type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', colorScheme: 'dark' }}
              />
            </div>

            <button
              onClick={handleAddPost}
              style={{ padding: '10px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
            >
              Add Post
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostCard({ post }: { post: ReturnType<typeof useDashboard>['posts'][0] }) {
  const caption = post.caption.length > 80 ? post.caption.slice(0, 80) + '…' : post.caption;

  return (
    <div
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.15s', cursor: 'default' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <StatusChip status={post.status} />
        <TypeChip type={post.type} />
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.3' }}>{post.title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', flex: 1 }}>{caption}</div>
      {post.scheduledDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto' }}>
          <CalendarDays size={12} style={{ color: 'var(--text-faint)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            {new Date(post.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}
