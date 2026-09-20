import { AppText } from "@/components/ui/app-text";
import { AppCard } from "./app-card";

interface EmptyStateCardProps {
  title: string;
  description: string;
}

/** Shared empty-state block: bold title + secondary description. */
export function EmptyStateCard({ title, description }: EmptyStateCardProps): React.JSX.Element {
  return (
    <AppCard>
      <AppText className="text-base font-semibold text-text-primary">{title}</AppText>
      <AppText className="mt-1 text-sm leading-5 text-text-secondary">{description}</AppText>
    </AppCard>
  );
}
