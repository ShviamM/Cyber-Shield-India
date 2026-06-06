// RevenueCat REST client for server-side / script use.
// Auth is handled by the Replit RevenueCat connector (integration id:
// connection:conn_revenuecat...). The connectors proxy injects and refreshes
// the OAuth token automatically, so we never handle the API key directly.
import { ReplitConnectors } from "@replit/connectors-sdk";
import { createClient } from "@replit/revenuecat-sdk/client";

// Never cache the client — the proxy fetch refreshes auth per request.
export async function getUncachableRevenueCatClient() {
  const connectors = new ReplitConnectors();
  const proxyFetch = connectors.createProxyFetch("revenuecat");

  return createClient({
    baseUrl: "https://api.revenuecat.com/v2",
    fetch: proxyFetch,
  });
}
