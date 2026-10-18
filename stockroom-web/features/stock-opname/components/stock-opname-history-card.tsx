import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockOpnameDetail } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { dateFormatter, formatStatusTransition } from "./stock-opname-detail.utils";

export function StockOpnameHistoryCard({
  histories,
}: {
  histories: StockOpnameDetail["histories"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status history</CardTitle>
      </CardHeader>
      <CardContent>
        {histories.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No status history.
          </p>
        ) : (
          <Table className="min-w-[580px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Date</TableHead>
                <TableHead scope="col">User</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histories.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>
                    {dateFormatter.format(new Date(history.createdAt))}
                  </TableCell>
                  <TableCell>{history.user.name}</TableCell>
                  <TableCell>
                    {formatStatusTransition(
                      history.fromStatus,
                      history.toStatus
                    )}
                  </TableCell>
                  <TableCell>{history.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
