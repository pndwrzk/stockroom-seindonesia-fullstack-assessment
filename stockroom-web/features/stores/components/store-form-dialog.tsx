"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoreFormValues } from "@/features/stores/schemas/store-mutation.schema";
import { storeFormSchema } from "@/features/stores/schemas/store-mutation.schema";
import type { StoreRecord } from "@/features/stores/schemas/stores.schema";

type StoreFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreRecord | null;
  isSaving: boolean;
  onSubmit: (values: StoreFormValues) => Promise<boolean>;
};

export function StoreFormDialog({
  open,
  onOpenChange,
  store,
  isSaving,
  onSubmit,
}: StoreFormDialogProps) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: { code: "", name: "", address: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      code: store?.code ?? "",
      name: store?.name ?? "",
      address: store?.address ?? "",
    });
  }, [open, reset, store]);

  const submit = form.handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{store ? "Update store" : "Add store"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={submit}>
          <FormField label="Code" htmlFor="store-code" error={form.formState.errors.code?.message}>
            <Input id="store-code" required autoComplete="off" {...form.register("code")} />
          </FormField>
          <FormField label="Name" htmlFor="store-name" error={form.formState.errors.name?.message}>
            <Input id="store-name" required {...form.register("name")} />
          </FormField>
          <FormField
            label="Address"
            htmlFor="store-address"
            error={form.formState.errors.address?.message}
          >
            <Textarea
              id="store-address"
              required
              rows={3}
              {...form.register("address")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || form.formState.isSubmitting}>
              {isSaving ? "Saving..." : store ? "Save changes" : "Create store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
