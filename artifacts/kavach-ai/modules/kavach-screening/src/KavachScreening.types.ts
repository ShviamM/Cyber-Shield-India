/** Snapshot of the native screening state, reported by `getStatus()`. */
export type ScreeningStatus = {
  /** Whether call screening is toggled on in native storage. */
  callScreening: boolean;
  /** Whether SMS screening is toggled on in native storage. */
  smsScreening: boolean;
  /** Whether Netraksh currently holds the system call-screening role. */
  hasCallRole: boolean;
  /** Whether the RECEIVE_SMS runtime permission is granted. */
  hasSmsPermission: boolean;
  /** Whether the POST_NOTIFICATIONS permission is granted (Android 13+). */
  hasNotificationPermission: boolean;
  /**
   * Whether full-screen-intent notifications can launch full-screen. Android 14+
   * revokes this by default for non-dialer apps; true on older versions.
   */
  hasFullScreenIntentPermission: boolean;
  /** Whether "Display over other apps" (SYSTEM_ALERT_WINDOW) is granted. */
  hasOverlayPermission: boolean;
  /** Whether ANSWER_PHONE_CALLS is granted (needed to answer/end live calls). */
  hasAnswerCallsPermission: boolean;
  /**
   * Whether the OS has exempted the app from battery optimization. When false,
   * aggressive OEM Doze can kill the screening service and miss incoming calls.
   */
  isIgnoringBatteryOptimizations: boolean;
  /** Number of high-risk numbers currently synced on-device. */
  blocklistSize: number;
  /** Number of scam keyword patterns currently synced on-device. */
  keywordCount: number;
};

/**
 * The most recent screened incoming call recorded by the native overlay, used to
 * drive the Play-safe post-call prompt for ANY screened call (not just ones
 * answered through the in-app alert).
 */
export type PendingScreenedCall = {
  number: string;
  /** Epoch milliseconds when the call was screened. */
  ts: number;
  /** Risk band at screen time ("high"/"medium"/"low"/"unknown"/"answered"). */
  risk: string;
  /** Whether the user answered this call through Netraksh. */
  answered: boolean;
};

/** Emitted when an incoming call is screened (foreground only). */
export type CallScreenedEvent = {
  number: string;
  blocked: boolean;
};

/** Emitted when an incoming SMS is screened (foreground only). */
export type SmsScreenedEvent = {
  sender: string;
  /** The matched scam keyword, or "" if matched only on a blocked sender. */
  keyword: string;
};

export type KavachScreeningEvents = {
  onCallScreened: (event: CallScreenedEvent) => void;
  onSmsScreened: (event: SmsScreenedEvent) => void;
};
