import { LinearClient } from "@linear/sdk";

let linearClient: LinearClient | null = null;

export function initializeLinearClient(apiKey: string): LinearClient {
  linearClient = new LinearClient({ apiKey });
  return linearClient;
}

export function getLinearClient(): LinearClient {
  if (!linearClient) {
    throw new Error(
      "Linear client not initialized. Please set up your API key."
    );
  }
  return linearClient;
}

export function clearLinearClient(): void {
  linearClient = null;
}

export function isLinearClientInitialized(): boolean {
  return linearClient !== null;
}
