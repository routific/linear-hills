import { getFromStorage, setToStorage, removeFromStorage } from "./index";
import { STORAGE_KEYS } from "./schemas";

export function getApiKey(): string | null {
  return getFromStorage<string>(STORAGE_KEYS.API_KEY);
}

export function setApiKey(apiKey: string): boolean {
  return setToStorage(STORAGE_KEYS.API_KEY, apiKey);
}

export function removeApiKey(): boolean {
  return removeFromStorage(STORAGE_KEYS.API_KEY);
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}
