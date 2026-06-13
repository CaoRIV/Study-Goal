import Image from "next/image";

import { cn } from "@/lib/utils";

export function StudyGoalLogo({
  className,
  priority = false
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white shadow-lg shadow-black/25 ring-1 ring-white/20",
        className
      )}
    >
      <Image
        src="/study-goal-logo.png"
        alt="Study Goal"
        fill
        priority={priority}
        sizes="48px"
        className="object-contain"
      />
    </span>
  );
}
