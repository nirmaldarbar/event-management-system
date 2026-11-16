const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (config) => {
      // react-datepicker uses a dynamic import for locales; harmless, but it fails CI=true builds.
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /react-datepicker/, message: /Critical dependency/ },
      ];
      return config;
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  },
};
