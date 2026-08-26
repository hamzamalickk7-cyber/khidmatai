import { Settings } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

export default async function SettingsPage(){await requireCurrentAuthenticationSession("/settings");return <SimpleComingSoonPageView title="Settings are coming soon" description="Account settings will be available here." IconComponent={Settings}/>} 
