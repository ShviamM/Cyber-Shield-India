const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Adds `android:showWhenLocked` and `android:turnScreenOn` to MainActivity so
 * the incoming-call experience can wake and show over the lock screen. The
 * native overlay (KavachCallOverlay) is the primary path, but on devices where
 * the overlay can't draw we fall back to a full-screen-intent notification that
 * launches MainActivity onto the call-alert route — these flags let that
 * fallback appear on a locked/dozing device. Play-safe: no new permission.
 */
module.exports = function withCallScreenManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application || !Array.isArray(application.activity)) return cfg;

    const main = application.activity.find(
      (a) => a.$?.["android:name"] === ".MainActivity",
    );
    if (main) {
      main.$["android:showWhenLocked"] = "true";
      main.$["android:turnScreenOn"] = "true";
    }
    return cfg;
  });
};
