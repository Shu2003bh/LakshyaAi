import { getIndustryInsights } from "@/actions/industry-insight";
import { getDashboardData } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const [insights, dashboardData] = await Promise.all([
    getIndustryInsights(),
    getDashboardData(),
  ]);

  return (
    <div className="w-full">
      <DashboardView insights={insights} dashboardData={dashboardData} />
    </div>
  );
}
