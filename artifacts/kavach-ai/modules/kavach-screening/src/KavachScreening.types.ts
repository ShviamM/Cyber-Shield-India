/** Snapshot of the native screening state, reported by `getStatus()`. */
export type ScreeningStatus = {
  /** Whether call screening is toggled on in native storage. */
  callScreening: boolean;
  /** Whether SMS screening is toggled on in native storage. */
  smsScreening: boolean;
  /** Whether KavachAI currently holds the system call-screening role. */
  hasCallRole: boolean;
  /** Whether the RECEIVE_SMS runtime permission is granted. */
  hasSmsPermission: boolean;
  /** Whether the POST_NOTIFICATIONS permission is granted (Android 13+). */
  hasNotificationPermission: boolean;
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
