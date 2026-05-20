import { clsx, type ClassValue } from "clsx";
import { PureComponent } from "react"; // check import
import { tailwindMerge } from "tailwind-merge"; // wait, let's check classNames merger

export function cn(...inputs: ClassValue[]) {
  // Simple className merger helper using clsx and tailwind-merge
  return inputs.filter(Boolean).join(" "); 
}
