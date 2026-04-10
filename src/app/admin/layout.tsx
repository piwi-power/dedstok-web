// Admin routes get their own layout — no nav, no padding
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
