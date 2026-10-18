import type { StockOpnameItem } from "@/features/stock-opname/schemas/stock-opnames.schema";

export function createStockOpnameCsv(items: StockOpnameItem[]): string {
  const rows = [
    ["SKU", "Product", "Unit", "System Qty", "Counted Qty"],
    ...items.map((item) => [
      item.product.sku,
      item.product.name,
      item.product.unit ?? "",
      String(item.systemQty),
      item.countedQty === null ? "" : String(item.countedQty),
    ]),
  ];

  return rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
}

export function parseStockOpnameCsv(
  csv: string,
  items: StockOpnameItem[]
): Record<string, string> {
  const csvRows = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (csvRows.length < 2) {
    throw new Error("The CSV file has no product rows.");
  }

  const headers = csvRows[0].map(normalizeCsvHeader);
  const skuColumn = headers.indexOf("sku");
  const countedQtyColumn = headers.indexOf("countedqty");
  if (skuColumn === -1 || countedQtyColumn === -1) {
    throw new Error("CSV must include SKU and Counted Qty columns.");
  }

  const importedCounts = new Map<string, string>();
  const seenSkus = new Set<string>();
  for (const [index, row] of csvRows.slice(1).entries()) {
    const sku = row[skuColumn]?.trim();
    const countedQty = row[countedQtyColumn]?.trim();
    if (!sku) {
      throw new Error(`Missing SKU on CSV row ${index + 2}.`);
    }
    if (seenSkus.has(sku)) {
      throw new Error(`Duplicate SKU on CSV row ${index + 2}.`);
    }
    seenSkus.add(sku);
    if (!countedQty) {
      continue;
    }
    if (
      !/^\d+$/.test(countedQty) ||
      !Number.isSafeInteger(Number(countedQty))
    ) {
      throw new Error(
        `Invalid Counted Qty on CSV row ${index + 2}. Use a whole number zero or greater.`
      );
    }
    importedCounts.set(sku, countedQty);
  }

  if (importedCounts.size === 0) {
    throw new Error("Enter at least one Counted Qty value in the CSV.");
  }

  const itemsBySku = new Map(items.map((item) => [item.product.sku, item]));
  const importedDrafts: Record<string, string> = {};
  for (const [sku, countedQty] of importedCounts) {
    const item = itemsBySku.get(sku);
    if (!item) {
      throw new Error(`SKU ${sku} does not belong to this stock opname.`);
    }
    importedDrafts[item.productId] = countedQty;
  }

  return importedDrafts;
}

function escapeCsvValue(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function normalizeCsvHeader(header: string): string {
  return header
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (insideQuotes) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      insideQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && csv[index + 1] === "\n") {
        index++;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (insideQuotes) {
    throw new Error("The CSV file contains an unclosed quoted value.");
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ""));
}
