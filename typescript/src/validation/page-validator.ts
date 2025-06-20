import type { Page } from "../models/generated/page/page";
import { isPage } from "../models/generated/essential-types";

export function validatePage(obj: unknown): obj is Page {
  console.log("isPage(obj) ", isPage(obj));
  return (
    isPage(obj) &&
    typeof (obj as any).id === "string" &&
    Array.isArray((obj as any).children)
  );
}

export function validatePageWithError(obj: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!isPage(obj)) {
    return { valid: false, error: "Not a valid page object" };
  }

  if (typeof (obj as any).id !== "string") {
    return { valid: false, error: "Page id must be a string" };
  }

  if (!Array.isArray((obj as any).children)) {
    return { valid: false, error: "Page children must be an array" };
  }

  return { valid: true };
}
