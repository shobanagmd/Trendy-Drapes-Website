import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex-1 pr-2">{title}</p>
        <div className={cn("rounded-lg flex shrink-0 items-center justify-center h-8 w-8", iconColor || "bg-primary/10")}>
          <Icon className={cn("h-4 w-4 shrink-0", iconColor ? "text-card-foreground" : "text-primary")} />
        </div>
      </div>
      <p className="text-xl font-bold text-card-foreground">{value}</p>
      {change && (
        <div className="mt-1.5 flex items-center gap-1">
          {changeType === "positive" ? (
            <ArrowUp className="h-3 w-3 text-success" />
          ) : changeType === "negative" ? (
            <ArrowDown className="h-3 w-3 text-destructive" />
          ) : null}
          <p
            className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        </div>
      )}
    </div>
  );
}
