// Auto-register every locale namespace file under ./locales/<lng>/<ns>.ts.
// Adding a new file (e.g. ./locales/hi/pricing.ts) registers it automatically,
// so parallel work on separate namespaces never collides in a shared file.
const modules = import.meta.glob("./locales/*/*.ts", { eager: true });

export const resources: Record<string, Record<string, unknown>> = {};

for (const path in modules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.ts$/);
  if (!match) continue;
  const [, lng, ns] = match;
  const mod = modules[path] as { default?: unknown };
  if (!mod?.default) continue;
  resources[lng] ??= {};
  resources[lng][ns] = mod.default;
}

export const namespaces = Array.from(
  new Set(Object.values(resources).flatMap((r) => Object.keys(r))),
);
