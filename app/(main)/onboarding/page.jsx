// import { redirect } from "next/navigation";
// import { industries } from "@/data/industries";
// import OnboardingForm from "./_components/onboarding-form";
// import { getUserOnboardingStatus } from "@/actions/onboarding";


// export default async function OnboardingPage() {
//   // Check if user is already onboarded
//   const { isOnboarded } = await getUserOnboardingStatus();

//   if (isOnboarded) {
//     redirect("/dashboard");
//   }

//   return (
//     <main>
//       <OnboardingForm industries={industries} />
//     </main>
//   );
// 
import { getIndustryInsights } from "@/actions/industry-insight";
import { getDashboardData } from "@/actions/dashboard";
import DashboardView from "../dashboard/_component/dashboard-view";
import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/onboarding";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  // fetch both in parallel
  const [insights, dashboardData] = await Promise.all([
    getIndustryInsights(),
    getDashboardData(),
  ]);

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} dashboardData={dashboardData} />
    </div>
  );
}