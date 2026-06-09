import { registerWebModule, NativeModule } from "expo";

import type {
  KavachScreeningEvents,
  ScreeningStatus,
} from "./KavachScreening.types";

/**
 * Web (and any non-Android) fallback. On-device call/SMS screening only exists
 * on Android, so this no-op implementation reports "unavailable" and keeps the
 * JS API safe to call everywhere (web preview, iOS, Expo Go).
 */
class KavachScreeningModule extends NativeModule<KavachScreeningEvents> {
  isAvailable(): boolean {
    return false;
  }

  getStatus(): ScreeningStatus {
    return {
      callScreening: false,
      smsScreening: false,
      hasCallRole: false,
      hasSmsPermission: false,
      hasNotificationPermission: false,
      hasOverlayPermission: false,
      blocklistSize: 0,
      keywordCount: 0,
    };
  }

  setCallScreeningEnabled(_enabled: boolean): void {}

  setSmsScreeningEnabled(_enabled: boolean): void {}

  syncBlocklist(_numbers: string[]): void {}

  syncKeywords(_keywords: string[]): void {}

  syncLanguage(_code: string): void {}

  async requestCallScreeningRole(): Promise<boolean> {
    return false;
  }

  async requestOverlayPermission(): Promise<boolean> {
    return false;
  }
}

export default registerWebModule(KavachScreeningModule, "KavachScreening");
