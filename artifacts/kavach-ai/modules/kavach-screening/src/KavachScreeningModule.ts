import { NativeModule, requireOptionalNativeModule } from "expo";

import type {
  KavachScreeningEvents,
  ScreeningStatus,
} from "./KavachScreening.types";

declare class KavachScreeningModule extends NativeModule<KavachScreeningEvents> {
  isAvailable(): boolean;
  getStatus(): ScreeningStatus;
  setCallScreeningEnabled(enabled: boolean): void;
  setSmsScreeningEnabled(enabled: boolean): void;
  syncBlocklist(numbers: string[]): void;
  syncKeywords(keywords: string[]): void;
  syncLanguage(code: string): void;
  syncApiConfig(baseUrl: string, token: string | null): void;
  requestCallScreeningRole(): Promise<boolean>;
  requestOverlayPermission(): Promise<boolean>;
  requestFullScreenIntentPermission(): Promise<boolean>;
}

// Loads the native module backing the JS `KavachScreening` API on Android.
// Uses the *optional* loader so unsupported platforms (web preview, iOS, and
// Expo Go) resolve to `null` instead of throwing "Cannot find native module"
// at import time — that import throw previously crashed every route during
// bundling. lib/screening.ts gates every native call behind
// isScreeningSupported() (false off-Android) and wraps each call in try/catch,
// so a null instance is never dereferenced on unsupported platforms.
export default requireOptionalNativeModule<KavachScreeningModule>(
  "KavachScreening"
) as KavachScreeningModule;
