const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

// The SDK 57 template reads these release-only switches from gradle.properties.
// AGP 8.12 needs the third switch for its integrated resource/code shrinker.
const RELEASE_PROPERTIES = [
  'android.enableMinifyInReleaseBuilds',
  'android.enableShrinkResourcesInReleaseBuilds',
  'android.r8.optimizedResourceShrinking',
];

function configureReleaseProperties(properties) {
  for (const key of RELEASE_PROPERTIES) {
    const existing = properties.filter((entry) => entry.type === 'property' && entry.key === key);
    if (existing.length) {
      for (const entry of existing) entry.value = 'true';
    } else {
      properties.push({ type: 'property', key, value: 'true' });
    }
  }
  return properties;
}

function enableOptimizedProguardRules(contents) {
  const legacyRules = /getDefaultProguardFile\((["'])proguard-android\.txt\1\)/g;
  const optimizedRules = /getDefaultProguardFile\((["'])proguard-android-optimize\.txt\1\)/;
  if (!legacyRules.test(contents) && !optimizedRules.test(contents)) {
    throw new Error('Android release optimization: Expo default ProGuard configuration changed; review the release template before building.');
  }
  return contents.replace(legacyRules, 'getDefaultProguardFile("proguard-android-optimize.txt")');
}

// The optimized SDK 57 release build exhausts the template's 512 MiB metaspace.
// Preserve other JVM flags and any user-provided larger memory limits.
function configureGradleJvmMemory(properties) {
  let property = properties.find((entry) => entry.type === 'property' && entry.key === 'org.gradle.jvmargs');
  if (!property) {
    property = { type: 'property', key: 'org.gradle.jvmargs', value: '' };
    properties.push(property);
  }
  for (const [prefix, minimumMiB] of [['-Xmx', 4096], ['-XX:MaxMetaspaceSize=', 1024]]) {
    const pattern = new RegExp(`(^|\\s)(${prefix})(\\d+)([kmg]?)(?=\\s|$)`, 'i');
    const match = property.value.match(pattern);
    const multiplier = { '': 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 };
    if (match && Number(match[3]) * multiplier[match[4].toLowerCase()] >= minimumMiB * 1024 ** 2) continue;
    const option = `${prefix}${minimumMiB}m`;
    property.value = match
      ? property.value.replace(pattern, `${match[1]}${option}`)
      : `${property.value} ${option}`.trim();
  }
  return properties;
}

function withAndroidReleaseOptimization(config) {
  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('Android release optimization expects the Expo Groovy build template.');
    }
    mod.modResults.contents = enableOptimizedProguardRules(mod.modResults.contents);
    return mod;
  });
  return withGradleProperties(config, (mod) => {
    mod.modResults = configureGradleJvmMemory(configureReleaseProperties(mod.modResults));
    return mod;
  });
}

module.exports = withAndroidReleaseOptimization;
module.exports.configureReleaseProperties = configureReleaseProperties;
module.exports.enableOptimizedProguardRules = enableOptimizedProguardRules;
module.exports.configureGradleJvmMemory = configureGradleJvmMemory;
