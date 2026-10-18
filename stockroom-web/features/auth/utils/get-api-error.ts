import axios from "axios";
import { apiErrorResponseSchema } from "@/features/auth/schemas/auth-response.schema";

export function getApiError(error: unknown, fallbackMessage: string): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(fallbackMessage);
  }

  const response = apiErrorResponseSchema.safeParse(error.response?.data);
  if (response.success) {
    return new Error(response.data.message);
  }

  if (!error.response) {
    return new Error(fallbackMessage);
  }

  return new Error("The server could not complete the request.");
}
