/**
 * Admin root layout — intentionally a pass-through.
 *
 * Auth pages (login, forgot-password, reset-password) live directly under
 * /admin and must render WITHOUT an auth guard or admin chrome. The guard +
 * sidebar/header live in (protected)/layout.tsx, which wraps only the real
 * admin pages. This split prevents the login-page-guards-itself redirect loop.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
