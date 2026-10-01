const { getDefaultConfig } = require('expo/metro-config');

// SDK 52+ handles npm/yarn workspace monorepos automatically — no manual
// watchFolders/resolver overrides needed (and expo-doctor flags them as
// mismatches if added). See https://docs.expo.dev/guides/monorepos/.
module.exports = getDefaultConfig(__dirname);
