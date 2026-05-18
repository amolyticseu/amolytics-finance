import { cn } from "@/lib/utils"

type TeamMemberAvatarProps = {
  initials: string
  className?: string
}

export function TeamMemberAvatar({ initials, className }: TeamMemberAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-af-soft-blue text-xs font-semibold text-af-primary-blue",
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
