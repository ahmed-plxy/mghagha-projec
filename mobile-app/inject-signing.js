/**
 * inject-signing.js
 * Patches the Capacitor-generated android/app/build.gradle to:
 *   1. Add release signing config (from environment variables)
 *   2. Inject auto-incrementing versionCode + versionName (from CI run number)
 *
 * Run AFTER `npx cap add android` and BEFORE `./gradlew assembleRelease`.
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('ERROR: android/app/build.gradle not found. Run `npx cap add android` first.');
  process.exit(1);
}

// ── Version config ────────────────────────────────────────────────────────────
// VERSION_CODE comes from $GITHUB_RUN_NUMBER (auto-increments every CI build).
// Falls back to 1 for local runs.
const versionCode = parseInt(process.env.VERSION_CODE || '1', 10);
const versionName = `1.0.${versionCode}`;

// ── Signing config ────────────────────────────────────────────────────────────
const keystorePath  = path.resolve(__dirname, 'mghagha-release.jks');
const keystorePassword = process.env.KEYSTORE_PASSWORD || '';
const keyAlias         = process.env.KEY_ALIAS || 'mghagha';
const keyPassword      = process.env.KEY_PASSWORD || '';

const signingEnabled = keystorePassword && keyPassword && fs.existsSync(keystorePath);

if (!signingEnabled) {
  console.warn('⚠️  Signing env vars or keystore file missing — skipping signing injection.');
} else {
  console.log('✅ Signing config will be injected.');
}

// ── Patch build.gradle ────────────────────────────────────────────────────────
let gradle = fs.readFileSync(buildGradlePath, 'utf8');

// 1. Replace versionCode and versionName with CI values
gradle = gradle.replace(
  /versionCode\s+\d+/,
  `versionCode ${versionCode}`
);
gradle = gradle.replace(
  /versionName\s+"[^"]*"/,
  `versionName "${versionName}"`
);

// 2. Add signingConfigs block (only when secrets are available)
if (signingEnabled) {
  const signingConfig = `
    signingConfigs {
        release {
            storeFile file("${keystorePath.replace(/\\/g, '/')}")
            storePassword "${keystorePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
    }
`;
  gradle = gradle.replace(
    /android\s*\{/,
    `android {\n${signingConfig}`
  );

  // 3. Apply signingConfig to the release buildType
  gradle = gradle.replace(
    /(buildTypes\s*\{[\s\S]*?release\s*\{)/,
    '$1\n            signingConfig signingConfigs.release'
  );
}

// 4. Keep APK installable outside Play Store (disable code shrinking)
gradle = gradle.replace(/minifyEnabled\s+\w+/g, 'minifyEnabled false');

fs.writeFileSync(buildGradlePath, gradle, 'utf8');

console.log('');
console.log('android/app/build.gradle patched:');
console.log(`  versionCode : ${versionCode}`);
console.log(`  versionName : ${versionName}`);
if (signingEnabled) {
  console.log(`  keystore    : ${keystorePath}`);
  console.log(`  keyAlias    : ${keyAlias}`);
}
