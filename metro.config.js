const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Force zustand to use CJS by aliasing
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

// Block zustand's ESM files and use CJS
config.resolver.blockList = [
  /node_modules\/zustand\/esm\/.*/,
];

module.exports = withNativeWind(config, { input: './global.css' });
