// One-off seed script to set up RevenueCat entities for Netraksh.
// Run with: pnpm --filter @workspace/scripts exec tsx src/seedRevenueCat.ts
// Auth via the Replit RevenueCat connector (see revenueCatClient.ts).
import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "Netraksh";

const APP_STORE_APP_NAME = "Netraksh (iOS)";
const APP_STORE_BUNDLE_ID = "com.kavachai.app";
const PLAY_STORE_APP_NAME = "Netraksh (Android)";
const PLAY_STORE_PACKAGE_NAME = "com.kavachai.com";

const ENTITLEMENT_IDENTIFIER = "premium";
const ENTITLEMENT_DISPLAY_NAME = "Premium Access";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

type ProductPrice = { amount_micros: number; currency: string };

type ProductConfig = {
  // store_identifier for the test store + app store products
  baseIdentifier: string;
  // Play Store store_identifier must follow {subscriptionId}:{basePlanId}
  playStoreIdentifier: string;
  displayName: string;
  userFacingTitle: string;
  duration: "P1W" | "P1M" | "P2M" | "P3M" | "P6M" | "P1Y";
  packageLookupKey: string;
  packageDisplayName: string;
  // Test store prices only — production prices are set in the Play Console.
  prices: ProductPrice[];
};

const PRODUCTS: ProductConfig[] = [
  {
    baseIdentifier: "premium_monthly",
    playStoreIdentifier: "premium_monthly:monthly",
    displayName: "Premium Monthly",
    userFacingTitle: "Premium",
    duration: "P1M",
    packageLookupKey: "$rc_monthly",
    packageDisplayName: "Premium Monthly",
    // Test store only (USD). Real ₹10/mo price is configured in the Play Console.
    prices: [{ amount_micros: 990_000, currency: "USD" }],
  },
  {
    baseIdentifier: "family_monthly",
    playStoreIdentifier: "family_monthly:monthly",
    displayName: "Family Monthly",
    userFacingTitle: "Family",
    duration: "P1M",
    packageLookupKey: "family",
    packageDisplayName: "Family Monthly",
    // Test store only (USD). Real ₹49/mo price is configured in the Play Console.
    prices: [{ amount_micros: 4_990_000, currency: "USD" }],
  },
  {
    baseIdentifier: "premium_annual",
    playStoreIdentifier: "premium_annual:annual",
    displayName: "Premium Annual",
    userFacingTitle: "Premium",
    duration: "P1Y",
    packageLookupKey: "$rc_annual",
    packageDisplayName: "Premium Annual",
    // Test store only (USD). Real ₹99/yr price (~2 months free) is set in Play Console.
    prices: [{ amount_micros: 9_990_000, currency: "USD" }],
  },
  {
    baseIdentifier: "family_annual",
    playStoreIdentifier: "family_annual:annual",
    displayName: "Family Annual",
    userFacingTitle: "Family",
    duration: "P1Y",
    packageLookupKey: "family_annual",
    packageDisplayName: "Family Annual",
    // Test store only (USD). Real ₹449/yr price (~2 months free) is set in Play Console.
    prices: [{ amount_micros: 44_990_000, currency: "USD" }],
  },
];

type TestStorePricesResponse = {
  object: string;
  prices: ProductPrice[];
};

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  // --- Project ---
  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({
      client,
      body: { name: PROJECT_NAME },
    });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  // --- Apps (test store auto-created with project; ensure app + play stores) ---
  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) {
    throw new Error("No apps found");
  }

  const app: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!app) throw new Error("No app with test store found");
  console.log("App with test store found:", app.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: APP_STORE_APP_NAME,
        type: "app_store",
        app_store: { bundle_id: APP_STORE_BUNDLE_ID },
      },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app found:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: PLAY_STORE_APP_NAME,
        type: "play_store",
        play_store: { package_name: PLAY_STORE_PACKAGE_NAME },
      },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app found:", playStoreApp.id);
  }

  // --- Products ---
  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProductsError) throw new Error("Failed to list products");

  const ensureProductForApp = async (
    targetApp: App,
    label: string,
    cfg: ProductConfig,
    productIdentifier: string,
    isTestStore: boolean,
  ): Promise<Product> => {
    const existing = existingProducts.items?.find(
      (p) => p.store_identifier === productIdentifier && p.app_id === targetApp.id,
    );
    if (existing) {
      console.log(label + " product already exists:", existing.id);
      return existing;
    }

    const body: CreateProductData["body"] = {
      store_identifier: productIdentifier,
      app_id: targetApp.id,
      type: "subscription",
      display_name: cfg.displayName,
    };
    if (isTestStore) {
      body.subscription = { duration: cfg.duration };
      body.title = cfg.userFacingTitle;
    }

    const { data: created, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });
    if (error) throw new Error("Failed to create " + label + " product");
    console.log("Created " + label + " product:", created.id);
    return created;
  };

  // Collect every product id so we can attach them all to the single entitlement.
  const allProductIds: string[] = [];

  // Per offering we attach (test/app/play) product for each config.
  type ProductBundle = {
    cfg: ProductConfig;
    testStore: Product;
    appStore: Product;
    playStore: Product;
  };
  const bundles: ProductBundle[] = [];

  for (const cfg of PRODUCTS) {
    const testStoreProduct = await ensureProductForApp(app, `Test Store (${cfg.baseIdentifier})`, cfg, cfg.baseIdentifier, true);
    const appStoreProduct = await ensureProductForApp(appStoreApp, `App Store (${cfg.baseIdentifier})`, cfg, cfg.baseIdentifier, false);
    const playStoreProduct = await ensureProductForApp(playStoreApp, `Play Store (${cfg.baseIdentifier})`, cfg, cfg.playStoreIdentifier, false);

    allProductIds.push(testStoreProduct.id, appStoreProduct.id, playStoreProduct.id);
    bundles.push({ cfg, testStore: testStoreProduct, appStore: appStoreProduct, playStore: playStoreProduct });

    // Test store prices (undocumented endpoint). Production prices come from the store.
    console.log(`Adding test store prices for ${cfg.baseIdentifier}:`, JSON.stringify(cfg.prices));
    const { error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testStoreProduct.id },
      body: { prices: cfg.prices },
    });
    if (priceError) {
      if (priceError && typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
        console.log("Test store prices already exist for", cfg.baseIdentifier);
      } else {
        console.error("Price error detail:", JSON.stringify(priceError, null, 2));
        throw new Error("Failed to add test store prices for " + cfg.baseIdentifier);
      }
    } else {
      console.log("Added test store prices for", cfg.baseIdentifier);
    }
  }

  // --- Entitlement ("premium") ---
  let entitlement: Entitlement | undefined;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  const existingEntitlement = existingEntitlements.items?.find((e) => e.lookup_key === ENTITLEMENT_IDENTIFIER);
  if (existingEntitlement) {
    console.log("Entitlement already exists:", existingEntitlement.id);
    entitlement = existingEntitlement;
  } else {
    const { data: newEntitlement, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEntitlement.id);
    entitlement = newEntitlement;
  }

  const { error: attachEntitlementError } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });
  if (attachEntitlementError) {
    if (attachEntitlementError.type === "unprocessable_entity_error") {
      console.log("Some products already attached to entitlement");
    } else {
      throw new Error("Failed to attach products to entitlement");
    }
  } else {
    console.log("Attached products to entitlement");
  }

  // --- Offering ("default") ---
  let offering: Offering | undefined;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOfferingsError) throw new Error("Failed to list offerings");

  const existingOffering = existingOfferings.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOffering) {
    console.log("Offering already exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data: newOffering, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOffering.id);
    offering = newOffering;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  // --- Packages (one per product) ---
  const { data: existingPackages, error: listPackagesError } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPackagesError) throw new Error("Failed to list packages");

  for (const bundle of bundles) {
    const { cfg } = bundle;
    let pkgId: string;
    const existingPackage = existingPackages.items?.find((p) => p.lookup_key === cfg.packageLookupKey);
    if (existingPackage) {
      console.log(`Package ${cfg.packageLookupKey} already exists:`, existingPackage.id);
      pkgId = existingPackage.id;
    } else {
      const { data: newPackage, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: { lookup_key: cfg.packageLookupKey, display_name: cfg.packageDisplayName },
      });
      if (error) throw new Error("Failed to create package " + cfg.packageLookupKey);
      console.log(`Created package ${cfg.packageLookupKey}:`, newPackage.id);
      pkgId = newPackage.id;
    }

    const { error: attachPackageError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkgId },
      body: {
        products: [
          { product_id: bundle.testStore.id, eligibility_criteria: "all" },
          { product_id: bundle.appStore.id, eligibility_criteria: "all" },
          { product_id: bundle.playStore.id, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPackageError) {
      if (attachPackageError.type === "unprocessable_entity_error" && attachPackageError.message?.includes("Cannot attach product")) {
        console.log(`Skipping attach for ${cfg.packageLookupKey}: already has incompatible product`);
      } else {
        throw new Error("Failed to attach products to package " + cfg.packageLookupKey);
      }
    } else {
      console.log(`Attached products to package ${cfg.packageLookupKey}`);
    }
  }

  // --- Public API keys ---
  const { data: testStoreApiKeys, error: testStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: app.id },
  });
  if (testStoreApiKeysError) throw new Error("Failed to list public API keys for Test Store app");

  const { data: appStoreApiKeys, error: appStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: appStoreApp.id },
  });
  if (appStoreApiKeysError) throw new Error("Failed to list public API keys for App Store app");

  const { data: playStoreApiKeys, error: playStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: playStoreApp.id },
  });
  if (playStoreApiKeysError) throw new Error("Failed to list public API keys for Play Store app");

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", app.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement Identifier:", ENTITLEMENT_IDENTIFIER);
  console.log("Public API Keys - Test Store:", testStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("Public API Keys - App Store:", appStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("Public API Keys - Play Store:", playStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("====================\n");
}

seedRevenueCat().catch((err) => {
  console.error(err);
  process.exit(1);
});
