import { Star } from "lucide-react";
import { AdministrationPlaceholderWorkspace } from "@/modules/administration/components/administration-placeholder-workspace";

export default function AdministrationReviewsPage() {
  return (
    <AdministrationPlaceholderWorkspace
      title="Reviews"
      description="Review customer feedback, moderation signals and reported ratings."
      Icon={Star}
    />
  );
}
