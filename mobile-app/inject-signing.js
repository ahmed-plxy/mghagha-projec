/**
 * inject-signing.js
 * Patches the Capacitor-generated android/app/build.gradle
 * to add release signing config from environment variables.
 * Run this AFTER `npx cap add android` and BEFORE `./gradlew assembleRelease`.
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('ERROR: android/app/build.gradle not found. Run `npx cap add android` first.');
  process.exit(1);
}

const keystorePath = path.resolve(__dirname, 'mghagha-release.jks');
const keystorePassword = process.env.KEYSTORE_PASSWORD || '';
const keyAlias = process.env.KEY_ALIAS || 'mghagha';
const keyPassword = process.env.KEY_PASSWORD || '';

if (!keystorePassword || !keyPassword) {
  console.error('ERROR: KEYSTORE_PASSWORD and KEY_PASSWORD environment variables are required.');
  process.exit(1);
}

if (!fs.existsSync(keystorePath)) {
  console.error(`ERROR: Keystore not found at ${keystorePath}`);
  process.exit(1);
}

let gradle = fs.readFileSync(buildGradlePath, 'utf8');

// 1. Add signingConfigs block right after `android {`
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

// 2. Apply signingConfig to the release buildType
gradle = gradle.replace(
  /buildTypes\s*\{[\s\S]*?release\s*\{/,
  (match) => match + '\n            signingConfig signingConfigs.release'
);

// 3. Ensure minifyEnabled false and disable shrinking to keep APK installable outside Play Store
gradle = gradle.replace(
  /minifyEnabled\s+\w+/g,
  'minifyEnabled false'
);

fs.writeFileSync(buildGradlePath, gradle, 'utf8');
console.log('✅ Signing config injected into android/app/build.gradle');
console.log(`   Keystore : ${keystorePath}`);
console.log(`   Key alias: ${keyAlias}`);
