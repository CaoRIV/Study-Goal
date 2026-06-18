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
        "relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand-paper shadow-lg shadow-cyan-950/35 ring-1 ring-cyan-300/28",
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
