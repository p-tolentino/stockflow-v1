import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryTableSkeleton() {
  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Name
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Category
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Supplier
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Unit
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Quantity
            </TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-100">
              Reorder Level
            </TableHead>
            <TableHead className="text-right font-semibold text-amber-900 dark:text-amber-100">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow
              key={i}
              className="border-b border-amber-100 dark:border-amber-900/50"
            >
              <TableCell>
                <Skeleton className="h-4 w-37.5 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-25 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-25 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5 bg-amber-200 dark:bg-amber-800" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 inline-block mr-2 bg-amber-200 dark:bg-amber-800" />
                <Skeleton className="h-8 w-8 inline-block bg-amber-200 dark:bg-amber-800" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
