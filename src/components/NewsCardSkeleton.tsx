export const NewsCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <div
    className="glass-card animate-fade-up overflow-hidden"
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    aria-hidden
  >
    <div className="space-y-3 p-5">
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-foreground/[0.06]" />
        <div className="h-6 w-20 rounded-full bg-foreground/[0.06]" />
      </div>
      <div className="h-3 w-24 rounded-full bg-foreground/[0.06]" />
      <div className="h-4 w-full rounded-full bg-foreground/[0.08]" />
      <div className="h-4 w-4/5 rounded-full bg-foreground/[0.08]" />
      <div className="h-3 w-full rounded-full bg-foreground/[0.05]" />
      <div className="h-3 w-full rounded-full bg-foreground/[0.05]" />
      <div className="h-3 w-2/3 rounded-full bg-foreground/[0.05]" />
      <div className="hairline flex items-center justify-between border-t pt-4">
        <div className="h-7 w-16 rounded-full bg-foreground/[0.06]" />
        <div className="h-7 w-16 rounded-full bg-foreground/[0.06]" />
      </div>
    </div>
  </div>
);
