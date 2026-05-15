import { AppShell } from "@/components/layout/AppShell";
import { requirePageAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePageAdmin();

  return (
    <AppShell role="ADMIN" email={user.email} name="Admin">
      {children}
    </AppShell>
  );
}
