'use client';

import { PostType } from '@/lib/types';

interface TypeChipProps {
  type: PostType;
}

export default function TypeChip({ type }: TypeChipProps) {
  return (
    <span
      style={{
        backgroundColor: '#333333',
        color: '#999999',
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {type}
    </span>
  );
}
