import React from "react";

interface HorizonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HorizonCard({ children, className = "", ...props }: HorizonCardProps) {
  return (
    <div
      className={`horizon-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
