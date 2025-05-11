// app.config.js
export default ({ config }) => {
  // Determine if the current build is for development based on EAS_BUILD_PROFILE
  const EAS_BUILD_PROFILE = process.env.EAS_BUILD_PROFILE;
  const IS_DEV = EAS_BUILD_PROFILE === 'development';

  // Start with the existing configuration passed by Expo CLI
  // This ensures any existing dynamic configurations or properties injected by Expo CLI are preserved.
  let appConfig = { ...config };

  // Ensure the expo object exists and spread its existing properties
  appConfig.expo = {
    ...(appConfig.expo || {}),

    // Static values (can be defaults or from original app.json)
    slug: "RyougiProject",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true, // Assuming this is a desired static value
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      ...(appConfig.expo && appConfig.expo.extra), // Preserve other 'extra' properties
      eas: {
        // Preserve other 'eas' properties if any, then set/override projectId
        ...(appConfig.expo && appConfig.expo.extra && appConfig.expo.extra.eas),
        projectId: "62902e06-c109-45ef-b939-bdae9f714109"
      }
    },

    // Dynamically set values based on IS_DEV
    name: IS_DEV ? "DayWay (Dev)" : "DayWay",

    ios: {
      ...(appConfig.expo && appConfig.expo.ios), // Spread existing specific iOS config
      supportsTablet: true, // Assuming this is a desired static value for iOS
      bundleIdentifier: IS_DEV ? "com.RyougiProject.DayWay.dev" : "com.RyougiProject.DayWay"
    },

    android: {
      ...(appConfig.expo && appConfig.expo.android), // Spread existing specific Android config
      adaptiveIcon: { // Assuming these are desired static values for Android
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true, // Assuming this is a desired static value for Android
      package: IS_DEV ? "com.RyougiProject.DayWay.dev" : "com.RyougiProject.DayWay"
    }
  };
  
  // Clean up owner field if it exists from a previous spread, as per user request
  if (appConfig.expo && appConfig.expo.owner) {
    delete appConfig.expo.owner;
  }
  // If owner was at the root of the original config object passed to this function
  if (appConfig.owner) {
    delete appConfig.owner;
  }

  return appConfig;
};