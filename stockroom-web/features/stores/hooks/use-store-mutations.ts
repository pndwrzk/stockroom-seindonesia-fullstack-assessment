"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createStoreService } from "@/features/stores/services/create-store.service";
import { deleteStoreService } from "@/features/stores/services/delete-store.service";
import { updateStoreService } from "@/features/stores/services/update-store.service";
import type { StoreFormValues } from "@/features/stores/schemas/store-mutation.schema";

export function useStoreMutations(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);

  const saveStore = async (storeId: string | null, values: StoreFormValues) => {
    setIsSaving(true);
    try {
      if (storeId) {
        await updateStoreService(storeId, values);
        toast({ title: "Store updated", description: "The store has been updated." });
      } else {
        await createStoreService(values);
        toast({ title: "Store created", description: "The store has been created." });
      }
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: storeId ? "Unable to update store" : "Unable to create store",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStore = async (storeId: string) => {
    setDeletingStoreId(storeId);
    try {
      await deleteStoreService(storeId);
      toast({ title: "Store deleted", description: "The store has been deleted." });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to delete store",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingStoreId(null);
    }
  };

  return { saveStore, deleteStore, isSaving, deletingStoreId };
}
