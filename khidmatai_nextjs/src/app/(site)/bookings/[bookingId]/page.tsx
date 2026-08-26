import { CalendarDays } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

interface BookingDetailsPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { bookingId } = await params;
  await requireCurrentAuthenticationSession(`/bookings/${bookingId}`);
  return <SimpleComingSoonPageView title="Booking details are coming soon" description="Booking details will be available when bookings launch." IconComponent={CalendarDays} />;
}
