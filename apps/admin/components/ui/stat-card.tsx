import React from "react";
import { HorizonCard } from "./horizon-card";
import { IconBox } from "./icon-box";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  isPending?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColorClass?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  isPending = false,
  icon,
  iconBg = "bg-[#F4F7FE] dark:bg-navy-700",
  iconColorClass = "text-primary dark:text-[#12BC7E]",
}: StatCardProps) {
  return (
    <HorizonCard className={`relative overflow-hidden flex items-center justify-between ${isPending ? "opacity-80" : ""}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <IconBox bg={iconBg} className={iconColorClass}>
            {icon}
          </IconBox>
        )}
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1.5">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            {value}
          </span>
          
          {change && (
            <div className="flex items-center gap-1 mt-1.5">
              {isPending ? (
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              ) : isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#01B574]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#EE5D50]" />
              )}
              <span
                className={`text-xs font-bold ${
                  isPending
                    ? "text-muted-foreground"
                    : isPositive
                    ? "text-[#01B574]"
                    : "text-[#EE5D50]"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </HorizonCard>
  );
}
