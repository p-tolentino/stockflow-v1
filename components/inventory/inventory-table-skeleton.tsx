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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-37.5" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-25" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-25" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12.5" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 inline-block mr-2" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
