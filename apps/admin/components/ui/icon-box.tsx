import React from "react";

interface IconBoxProps {
  children: React.ReactNode;
  className?: string;
  w?: string;
  h?: string;
  bg?: string;
}

export function IconBox({
  children,
  className = "",
  w = "w-[56px]",
  h = "h-[56px]",
  bg = "bg-slate-50 dark:bg-navy-700",
}: IconBoxProps) {
  return (
    <div
      className={`horizon-icon-box flex items-center justify-center flex-shrink-0 ${w} ${h} ${bg} ${className}`}
    >
      {children}
    </div>
  );
}
