import { z } from "zod";

export function getFromStorage<T>(key: string, schema?: z.ZodSchema<T>): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);

    if (schema) {
      return schema.parse(parsed);
    }

    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);

    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded. Consider clearing old data.");
    }

    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

export function clearStorage(): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}
