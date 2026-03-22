import Sidebar from '@/components/sidebar/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-primary)',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
