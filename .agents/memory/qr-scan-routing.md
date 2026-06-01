---
name: QR scan content routing
description: How decoded QR/scanned payloads must be mapped to fraud-engine check types.
---

When routing a decoded QR (or any free-form scanned/pasted payload) to the fraud engine, do NOT send a `upi://pay?...` deep link as the `upi` type.

**Why:** the engine's `upi` analyzer (`analyzeUpi` in `artifacts/api-server/src/lib/upi.ts`) validates against `UPI_RE` = `^name@bank$`, so a full `upi://pay?pa=...&am=...` URI fails to parse and yields no useful signal. The `message` analyzer, by contrast, runs `extractEntities` which pulls the embedded UPI id / amount / phone out of the URI and fuses their reputation.

**How to apply:** map http(s) URLs -> `url`, a bare `name@bank` -> `upi`, and everything else (including `upi://` deep links and plain text) -> `message`. This is implemented as `detectScanType` in `artifacts/kavach-ai/app/(tabs)/verify.tsx`. Note this differs from the older `detectType` helper, which maps `upi://` to the `upi` UI type — fine for share-prefill display but wrong as a direct engine type.
