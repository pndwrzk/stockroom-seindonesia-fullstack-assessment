import { Button } from "@/components/ui/button";

type DataPaginationProps = {
  itemCount: number;
  totalCount: number | null;
  page: number;
  totalPages: number | null;
  isLoading: boolean;
  itemLabel: string;
  onPageChange: (page: number) => void;
};

export function DataPagination({
  itemCount,
  totalCount,
  page,
  totalPages,
  isLoading,
  itemLabel,
  onPageChange,
}: DataPaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <p>
        {totalCount === null
          ? " "
          : `Showing ${itemCount} of ${totalCount} ${itemLabel}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages ?? 1}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || totalPages === null || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
