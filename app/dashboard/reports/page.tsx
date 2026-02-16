import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch low stock items
  const { data: lowStockItems } = await supabase
    .from("inventory_items")
    .select("name, current_quantity, reorder_level, unit")
    .eq("user_id", user.id)
    .lt("current_quantity", supabase.rpc("reorder_level"))
    .order("name");

  // Fetch recent movements (last 10)
  const { data: recentMovements } = await supabase
    .from("stock_movements")
    .select(
      `
      created_at,
      quantity_change,
      movement_type,
      inventory_items ( name )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems && lowStockItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-destructive font-bold">
                      {item.current_quantity}
                    </TableCell>
                    <TableCell>{item.reorder_level}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No low stock items.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements && recentMovements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((movement, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {format(new Date(movement.created_at), "PPp")}
                    </TableCell>
                    <TableCell>{movement.inventory_items?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          movement.movement_type === "in"
                            ? "default"
                            : movement.movement_type === "out"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {movement.movement_type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        movement.quantity_change > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {movement.quantity_change > 0
                        ? `+${movement.quantity_change}`
                        : movement.quantity_change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No recent movements.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
