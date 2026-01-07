module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        test: /node_modules[\/\\]zustand/,
        plugins: ['babel-plugin-transform-import-meta'],
      },
    ],
  };
};
