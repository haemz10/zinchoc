import { NextResponse } from "next/server";

// Digital Asset Links for the Android app (Trusted Web Activity).
// This proves the site and the Play Store app share an owner, which removes
// the browser URL bar so the installed app looks fully native.
//
// SHA256_FINGERPRINTS: paste the fingerprint(s) PWABuilder shows after it
// generates the Android package (also visible in Play Console → Setup → App
// signing → "SHA-256 certificate fingerprint"). More than one is allowed —
// include both the upload key and Google Play's app-signing key.
const PACKAGE_NAME = "com.coterie.community";
const SHA256_FINGERPRINTS: string[] = [
  // Upload key (PWABuilder signing.keystore, alias "my-key-alias") — the key
  // registered with Play as this app's upload key. SHA-1 0B:59:CA:30:...
  "BA:1E:EF:9B:A8:05:B4:7B:CE:0D:74:9A:06:17:54:95:DB:D4:03:93:7F:98:76:C7:43:53:4A:65:8B:34:48:2B",
  // TODO: after the first upload, add Google Play's app-signing key SHA-256
  // (Play Console → Setup → App signing → "App signing key certificate").
];

export function GET() {
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: SHA256_FINGERPRINTS,
      },
    },
  ];
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
