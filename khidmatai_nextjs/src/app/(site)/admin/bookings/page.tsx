import { CalendarDays } from "lucide-react";
import { AdministrationPlaceholderWorkspace } from "@/modules/administration/components/administration-placeholder-workspace";

export default function AdministrationBookingsPage() {
  return (
    <AdministrationPlaceholderWorkspace
      title="Bookings"
      description="Monitor service requests, booking progress, cancellations and disputes from one workspace."
      Icon={CalendarDays}
    />
  );
}
