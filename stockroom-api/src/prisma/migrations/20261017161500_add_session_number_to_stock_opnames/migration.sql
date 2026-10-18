ALTER TABLE "stock_opnames"
ADD COLUMN "session_number" VARCHAR(100);

UPDATE "stock_opnames" AS opname
SET "session_number" = stores."code" || '-' ||
  to_char(opname."created_at", 'YYYYMMDD"T"HH24MISSMS') || '-' ||
  left(opname."id"::text, 8)
FROM "stores"
WHERE stores."id" = opname."store_id";

ALTER TABLE "stock_opnames"
ALTER COLUMN "session_number" SET NOT NULL;

CREATE UNIQUE INDEX "stock_opnames_session_number_key"
ON "stock_opnames"("session_number");
