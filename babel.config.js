// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 确保 'react-native-reanimated/plugin' 是 plugins 数组中的最后一项
      'react-native-reanimated/plugin',
    ],
  };
};
