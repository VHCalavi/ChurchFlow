#!/bin/bash

# Fix UI components in all pages by replacing imports and components with Tailwind classes

echo "Fixing UI components..."

# Fix reports page
sed -i 's/import { Button } from "@\/components\/ui\/button";//g' apps/admin/app/dashboard/reports/page.tsx
sed -i 's/import { Input } from "@\/components\/ui\/input";//g' apps/admin/app/dashboard/reports/page.tsx
sed -i 's/import { Select.* } from "@\/components\/ui\/select";//g' apps/admin/app/dashboard/reports/page.tsx
sed -i 's/import { Badge } from "@\/components\/ui\/badge";//g' apps/admin/app/dashboard/reports/page.tsx
sed -i 's/<Badge /<span /g' apps/admin/app-dashboard/reports/page.tsx
sed -i 's/<\/Badge>/<\/span>/g' apps/admin/app-dashboard/reports/page.tsx
sed -i 's/variant="secondary"/class="px-3 py-1 rounded-full text-sm font-semibold bg-[#F4F7FE] text-[#006C69] border border-[#D6D1CE]"/g' apps/admin/app-dashboard/reports/page.tsx
sed -i 's/variant="outline"/class="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]"/g' apps/admin/app-dashboard/reports/page.tsx

echo "Fixed reports page"

