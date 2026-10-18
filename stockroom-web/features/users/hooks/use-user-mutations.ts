"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUserService } from "@/features/users/services/create-user.service";
import { deleteUserService } from "@/features/users/services/delete-user.service";
import { updateUserService } from "@/features/users/services/update-user.service";
import type { UserFormValues } from "@/features/users/schemas/user-mutation.schema";

export function useUserMutations(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const saveUser = async (userId: string | null, values: UserFormValues) => {
    setIsSaving(true);
    try {
      if (userId) {
        await updateUserService(userId, values);
        toast({ title: "User updated", description: "The user has been updated." });
      } else {
        await createUserService(values);
        toast({ title: "User created", description: "The user has been created." });
      }
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: userId ? "Unable to update user" : "Unable to create user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      await deleteUserService(userId);
      toast({ title: "User deleted", description: "The user has been deleted." });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to delete user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingUserId(null);
    }
  };

  return { saveUser, deleteUser, isSaving, deletingUserId };
}
