const { withAndroidManifest } = require('expo/config-plugins');

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = function withOptionalLocationFeatures(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = (manifest['uses-feature'] ??= []);

    // Nearby has a manual fallback. COARSE_LOCATION otherwise makes Google Play
    // require location hardware; Android also asks coarse users to declare network.
    // https://developer.android.com/guide/topics/manifest/uses-feature-element
    for (const name of ['android.hardware.location', 'android.hardware.location.network']) {
      const existing = features.filter((feature) => feature.$['android:name'] === name);
      if (existing.length) {
        for (const feature of existing) feature.$['android:required'] = 'false';
      } else {
        features.push({ $: { 'android:name': name, 'android:required': 'false' } });
      }
    }

    return config;
  });
};
