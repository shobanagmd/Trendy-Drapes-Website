import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StatCard({ title, value, todayValue, change, changeType = "neutral", icon: Icon, iconColor }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex-1 pr-2">{title}</p>
        <div className={cn("rounded-lg flex shrink-0 items-center justify-center h-8 w-8 shadow-sm", iconColor || "bg-primary/10")}>
          <Icon className={cn("h-4 w-4 shrink-0", iconColor ? "text-card-foreground" : "text-primary")} />
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5">
        <p className="text-2xl font-black text-card-foreground tracking-tight">{value}</p>
        {todayValue && (
          <p className="text-[11px] font-bold text-success flex items-center gap-1">
            +{todayValue} <span className="text-muted-foreground font-medium lowercase">today</span>
          </p>
        )}
      </div>

      {change && (
        <div className="mt-2.5 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            {changeType === "positive" ? (
              <div className="h-4 w-4 rounded-full bg-success/10 flex items-center justify-center">
                <ArrowUp className="h-2.5 w-2.5 text-success" />
              </div>
            ) : changeType === "negative" ? (
              <div className="h-4 w-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDown className="h-2.5 w-2.5 text-destructive" />
              </div>
            ) : null}
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
