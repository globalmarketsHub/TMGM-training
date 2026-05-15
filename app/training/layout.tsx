import { AppShell } from "@/components/layout/AppShell";
import { requirePageEmployee } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TrainingLayout({ children }: { children: React.ReactNode }) {
  const { user, employee } = await requirePageEmployee();

  return (
    <AppShell role="EMPLOYEE" email={user.email} name={employee.fullName}>
      {children}
    </AppShell>
  );
}
