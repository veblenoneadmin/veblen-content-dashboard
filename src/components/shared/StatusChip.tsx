'use client';

import { PostStatus } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/constants';

interface StatusChipProps {
  status: PostStatus;
}

export default function StatusChip({ status }: StatusChipProps) {
  const color = STATUS_COLORS[status] || '#888888';

  return (
    <span
      style={{
        backgroundColor: `${color}21`,
        color: color,
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
}
