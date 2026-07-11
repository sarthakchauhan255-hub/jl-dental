import { redirect }    from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { AuthProvider } from "@/context/auth-context";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader }  from "@/components/admin/header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/admin/login");

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-charcoal-50">
        <AdminSidebar />
        <div className="flex flex-1 flex-col lg:pl-60">
          <AdminHeader />
          <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
