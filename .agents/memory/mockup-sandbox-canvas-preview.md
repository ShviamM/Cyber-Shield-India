---
name: Mockup-sandbox canvas preview & screenshots
description: How to render and screenshot canvas hero/component mockups in the mockup-sandbox artifact
---

Canvas component mockups live in `artifacts/mockup-sandbox/src/components/mockups/<group>/<Comp>.tsx` and render at the path-based URL `/__mockup/preview/<group>/<Comp>` (sandbox served under `/__mockup`).

To screenshot one, use the `screenshot` tool with `type="app_preview"`, `artifact_dir_name="mockup-sandbox"`, `path="/preview/<group>/<Comp>"` (path is relative to the `/__mockup` preview prefix, so drop `/__mockup`).

**Why:** `type="external_url"` against the Replit dev domain hits the Replit auth wall and screenshots the login page, not the component. The internal proxy (app_preview) bypasses it.

**How to apply:** Place iframe shapes with `applyCanvasActions` create-auto (requires shapeIds + names + a shared parent shape). Shared brand tokens go in a parent-owned `<group>/_group.css` (`--nk-*` vars + reduced-motion `@media` reset). Edits are HMR-live — no workflow restart needed; verify via app_preview screenshot. Images referenced in mockups must use the `/__mockup/...` prefix (e.g. `/__mockup/images/netraksh-logo.png`).
