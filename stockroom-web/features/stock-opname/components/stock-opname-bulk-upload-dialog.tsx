"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getStockOpnameItemsService } from "@/features/stock-opname/services/get-stock-opname-detail.service";
import {
  createStockOpnameCsv,
  parseStockOpnameCsv,
} from "@/features/stock-opname/utils/stock-opname-csv";
import type { StockOpnameItem } from "@/features/stock-opname/schemas/stock-opnames.schema";

type StockOpnameBulkUploadDialogProps = {
  stockOpnameId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (drafts: Record<string, string>) => void;
};

export function StockOpnameBulkUploadDialog({
  stockOpnameId,
  open,
  onOpenChange,
  onUpload,
}: StockOpnameBulkUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getAllItems = async (): Promise<StockOpnameItem[]> => {
    const firstPage = await getStockOpnameItemsService(stockOpnameId, 1, 100);
    const allItems = [...firstPage.data];

    for (
      let pageNumber = 2;
      pageNumber <= firstPage.meta.totalPages;
      pageNumber++
    ) {
      const pageResult = await getStockOpnameItemsService(
        stockOpnameId,
        pageNumber,
        100
      );
      allItems.push(...pageResult.data);
    }

    return allItems;
  };

  const downloadCsvTemplate = async () => {
    setIsDownloading(true);
    try {
      const csv = createStockOpnameCsv(await getAllItems());
      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stock-opname-${stockOpnameId}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      toast({
        title: "Unable to download CSV template",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadCsv = async (file: File) => {
    setIsUploading(true);
    try {
      const items = await getAllItems();
      const drafts = parseStockOpnameCsv(await file.text(), items);
      onUpload(drafts);
      onOpenChange(false);
      toast({
        title: "CSV uploaded",
        description: `${Object.keys(drafts).length} counted quantities filled in the form.`,
      });
    } catch (error) {
      toast({
        title: "Unable to upload CSV",
        description:
          error instanceof Error
            ? error.message
            : "Please check the file and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isDownloading || isUploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isBusy) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader className="pr-6">
          <DialogTitle>Bulk upload counted quantities</DialogTitle>
          <DialogDescription>
            Fill in product counts with a spreadsheet, then load them into this
            stock opname.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Download the template, fill in the Counted Qty column, then upload
            it below. The template includes all products in this stock opname.
          </p>
          <div className="flex gap-3 rounded-xs border border-dashed border-border p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Upload aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-medium">Upload the completed CSV</p>
              <p className="text-xs text-muted-foreground">
                Blank Counted Qty cells are skipped. Your counts will appear in
                the table for review.
              </p>
              <input
                ref={fileInputRef}
                aria-label="Upload completed stock opname CSV"
                className="sr-only"
                type="file"
                accept=".csv,text/csv"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void uploadCsv(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                {isUploading ? "Uploading CSV..." : "Choose CSV file"}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4 justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => void downloadCsvTemplate()}
          >
            <Download aria-hidden="true" />
            {isDownloading ? "Preparing CSV..." : "Download template"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
