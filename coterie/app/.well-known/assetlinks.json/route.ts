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
  // Upload key (android.keystore, alias "coterie") used to sign the .aab.
  "8C:EF:C7:88:FC:90:83:4A:1F:4E:4F:CC:D0:E1:F8:F0:0A:E8:D4:1F:12:F6:A4:81:BF:FE:70:8E:83:13:08:CE",
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
