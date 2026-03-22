export default function uformatsPage() {
  return (
    <div style={{ padding: '32px' }}>
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
          uformats
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Coming soon
        </p>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>This section is coming soon</p>
        </div>
      </div>
    </div>
  );
}
