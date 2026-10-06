// Dynamic layer over app.json. Push notifications on Android need Firebase:
// the google-services.json path comes from the GOOGLE_SERVICES_JSON EAS file
// environment variable on build servers, or from a local file during
// development. Without either, the build still succeeds but Android push
// tokens can't be issued.
const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  const local = path.join(__dirname, "google-services.json");
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON || (fs.existsSync(local) ? "./google-services.json" : undefined);

  return {
    ...config,
    android: {
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
