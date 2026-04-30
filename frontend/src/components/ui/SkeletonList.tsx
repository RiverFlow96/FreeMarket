import { SkeletonCard } from "./SkeletonCard";

interface SkeletonListProps {
  count?: number;
}
export function SkeletonList({ count = 8 }: SkeletonListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
