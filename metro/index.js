const path = require('path');

const libPath = path.resolve(__dirname, '../lib/');

function withStackExMetro(config) {
  const originalResolveRequest = config.resolver?.resolveRequest;

  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('./transformer'),
    },
    resolver: {
      ...config.resolver,
      resolveRequest: (context, moduleName, platform) => {
        // expo-haptics → web polyfill (no-op vibration)
        if (moduleName === 'expo-haptics' && platform === 'web') {
          return {
            filePath: path.resolve(libPath, 'polyfills/haptics.web.js'),
            type: 'sourceFile',
          };
        }

        // expo-secure-store → localStorage wrapper
        if (moduleName === 'expo-secure-store' && platform === 'web') {
          return {
            filePath: path.resolve(libPath, 'polyfills/secure-store.web.js'),
            type: 'sourceFile',
          };
        }

        // react-native-maps → empty component
        if (moduleName === 'react-native-maps' && platform === 'web') {
          return {
            filePath: path.resolve(libPath, 'polyfills/maps.web.js'),
            type: 'sourceFile',
          };
        }

        if (originalResolveRequest) {
          return originalResolveRequest(context, moduleName, platform);
        }

        return context.resolveRequest(context, moduleName, platform);
      },
    },
  };
}

module.exports = { withStackExMetro };
