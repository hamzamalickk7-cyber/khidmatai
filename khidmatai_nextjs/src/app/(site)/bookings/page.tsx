import { CalendarDays } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

export default async function BookingsPage() { await requireCurrentAuthenticationSession("/bookings"); return <SimpleComingSoonPageView title="Bookings are coming soon" description="You will be able to manage all your bookings here." IconComponent={CalendarDays} />; }
