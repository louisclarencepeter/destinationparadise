import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const { configureReleaseProperties, enableOptimizedProguardRules, configureGradleJvmMemory } = require('../plugins/with-android-release-optimization.cjs');
const releaseKeys = [
  'android.enableMinifyInReleaseBuilds',
  'android.enableShrinkResourcesInReleaseBuilds',
  'android.r8.optimizedResourceShrinking',
];

test('release properties enable shrinking and obfuscation without changing unrelated options', () => {
  const input = [
    { type: 'comment', value: 'Preserve this comment' },
    { type: 'property', key: 'hermesEnabled', value: 'true' },
    { type: 'property', key: releaseKeys[0], value: 'false' },
  ];
  const output = configureReleaseProperties(structuredClone(input));
  assert.deepEqual(output.slice(0, 2), input.slice(0, 2));
  for (const key of releaseKeys) {
    assert.deepEqual(output.filter((entry: { key: string }) => entry.key === key), [
      { type: 'property', key, value: 'true' },
    ]);
  }
  assert.deepEqual(configureReleaseProperties(structuredClone(output)), output);
});

test('all existing duplicate switches agree so a later false value cannot disable R8', () => {
  const input = [true, false].map((value) => ({ type: 'property', key: releaseKeys[0], value: String(value) }));
  assert.ok(configureReleaseProperties(input).filter((entry: { key: string }) => entry.key === releaseKeys[0])
    .every((entry: { value: string }) => entry.value === 'true'));
});

test('release uses optimizing Android defaults while preserving application keep rules', () => {
  for (const quote of ['"', "'"]) {
    const input = `proguardFiles getDefaultProguardFile(${quote}proguard-android.txt${quote}), "proguard-rules.pro"`;
    const output = enableOptimizedProguardRules(input);
    assert.equal(output, 'proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"');
    assert.equal(enableOptimizedProguardRules(output), output);
  }
});

test('unrecognized ProGuard templates fail instead of silently disabling optimization', () => {
  assert.throws(() => enableOptimizedProguardRules('proguardFiles "custom-rules.pro"'), /configuration changed/);
});

test('R8 memory floors preserve unrelated JVM options and are idempotent', () => {
  const output = configureGradleJvmMemory([
    { type: 'property', key: 'org.gradle.jvmargs', value: '-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8' },
    { type: 'property', key: 'hermesEnabled', value: 'true' },
  ]);
  assert.equal(output[0].value, '-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8');
  assert.equal(output[1].value, 'true');
  assert.deepEqual(configureGradleJvmMemory(structuredClone(output)), output);
});

test('R8 memory floors preserve larger limits in JVM byte, kilobyte, megabyte and gigabyte units', () => {
  for (const value of [
    '-Xmx8589934592 -XX:MaxMetaspaceSize=2147483648',
    '-Xmx8388608k -XX:MaxMetaspaceSize=2097152k',
    '-Xmx8192m -XX:MaxMetaspaceSize=2048m',
    '-Xmx8g -XX:MaxMetaspaceSize=2g',
  ]) {
    assert.equal(configureGradleJvmMemory([{ type: 'property', key: 'org.gradle.jvmargs', value }])[0].value, value);
  }
});

test('R8 memory limits are added when JVM options are absent', () => {
  assert.deepEqual(configureGradleJvmMemory([]), [
    { type: 'property', key: 'org.gradle.jvmargs', value: '-Xmx4096m -XX:MaxMetaspaceSize=1024m' },
  ]);
});

test('generated Android configuration contains all release optimization properties', () => {
  const config = JSON.parse(execFileSync(process.execPath, [
    require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json',
  ], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }));
  const properties = config._internal.modResults.android.gradleProperties;
  for (const key of releaseKeys) {
    const matching = properties.filter((entry: { type: string; key: string }) => entry.type === 'property' && entry.key === key);
    assert.equal(matching.length, 1);
    assert.equal(matching[0].value, 'true');
  }
  assert.equal(properties.find((entry: { key: string }) => entry.key === 'org.gradle.jvmargs').value,
    '-Xmx4096m -XX:MaxMetaspaceSize=1024m');
});
