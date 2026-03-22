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
        backgroundColor: '#111111',
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#111111',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
