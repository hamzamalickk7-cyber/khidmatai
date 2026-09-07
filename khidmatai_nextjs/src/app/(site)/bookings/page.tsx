import { CalendarDays } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

export default async function BookingsPage() {
  await requireAuthenticatedAccountRole(["customer", "provider"], "/bookings");
  return <SimpleComingSoonPageView title="Bookings are coming soon" description="Customers and providers will be able to manage their role-specific bookings here." IconComponent={CalendarDays} />;
}
