import { NativeModule, requireNativeModule } from "expo";

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
  requestCallScreeningRole(): Promise<boolean>;
}

// Loads the native module backing the JS `KavachScreening` API on Android.
export default requireNativeModule<KavachScreeningModule>("KavachScreening");
