import { NextResponse } from "next/server";

// Digital Asset Links for the Android app (Trusted Web Activity).
// This proves the site and the Play Store app share an owner, which removes
// the browser URL bar so the installed app looks fully native.
//
// SHA256_FINGERPRINTS: paste the fingerprint(s) PWABuilder shows after it
// generates the Android package (also visible in Play Console → Setup → App
// signing → "SHA-256 certificate fingerprint"). More than one is allowed —
// include both the upload key and Google Play's app-signing key.
const PACKAGE_NAME = "club.coterie.twa";
const SHA256_FINGERPRINTS: string[] = [
  // e.g. "AB:CD:EF:...:12" — fill in from PWABuilder / Play Console.
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
