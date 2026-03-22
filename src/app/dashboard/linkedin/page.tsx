export default function LinkedInPage() {
  return (
    <div style={{ padding: '32px' }}>
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold text-white mb-2">
          LinkedIn
        </h1>
        <p style={{ color: '#888888', fontSize: '14px', marginBottom: '32px' }}>
          Manage your LinkedIn content
        </p>
        <div
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
          <p style={{ color: '#888888', fontSize: '14px' }}>This section is coming soon</p>
        </div>
      </div>
    </div>
  );
}
