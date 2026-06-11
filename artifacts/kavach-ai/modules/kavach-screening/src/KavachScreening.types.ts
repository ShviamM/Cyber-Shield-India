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
   * Whether Netraksh is exempt from battery optimization. When false, aggressive
   * OEM power managers can freeze/kill the screening service so the caller popup
   * never appears — the main cause of cross-device unreliability.
   */
  isIgnoringBatteryOptimizations: boolean;
  /** Device manufacturer (Build.MANUFACTURER), used to tailor OEM setup hints. */
  manufacturer: string;
  /** Number of high-risk numbers currently synced on-device. */
  blocklistSize: number;
  /** Number of scam keyword patterns currently synced on-device. */
  keywordCount: number;
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
