"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadImage } from "@/lib/upload";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Prefs = {
  inapp_comments: boolean;
  inapp_community_posts: boolean;
  inapp_joins: boolean;
  inapp_messages: boolean;
  banner_enabled: boolean;
  email_joins: boolean;
  email_listing_messages: boolean;
};

const DEFAULT_PREFS: Prefs = {
  inapp_comments: true,
  inapp_community_posts: true,
  inapp_joins: true,
  inapp_messages: true,
  banner_enabled: false,
  email_joins: false,
  email_listing_messages: false,
};

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export default function SettingsPage() {
  const [state, setState] = useState<"checking" | "denied" | "ready">(
    "checking"
  );
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Profile
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  // Notification prefs
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // My content
  const [myCommunities, setMyCommunities] = useState<
    { id: string; name: string }[]
  >([]);
  const [myListings, setMyListings] = useState<{ id: string; title: string }[]>(
    []
  );

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState("denied");
        return;
      }
      const uid = data.user.id;
      setUserId(uid);
      setEmail(data.user.email ?? "");

      const [{ data: me }, { data: p }, { data: cs }, { data: ls }] =
        await Promise.all([
          supabase
            .from("coterie_profiles")
            .select("username,display_name,bio,avatar_url")
            .eq("id", uid)
            .maybeSingle(),
          supabase
            .from("coterie_notification_prefs")
            .select("*")
            .eq("user_id", uid)
            .maybeSingle(),
          supabase
            .from("coterie_communities")
            .select("id,name")
            .eq("created_by", uid)
            .order("created_at", { ascending: false }),
          supabase
            .from("coterie_listings")
            .select("id,title")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
        ]);

      if (me) {
        setUsername(me.username ?? "");
        setDisplayName(me.display_name ?? "");
        setBio(me.bio ?? "");
        setAvatarUrl(me.avatar_url ?? null);
      }
      if (p) setPrefs({ ...DEFAULT_PREFS, ...p });
      setMyCommunities(cs ?? []);
      setMyListings(ls ?? []);
      setState("ready");
    });
  }, []);

  async function pickAvatar(file: File) {
    if (!file.type.startsWith("image/")) return;
    setProfileErr(null);
    const url = await uploadImage(supabaseBrowser(), userId, file);
    if (url) setAvatarUrl(url);
    else setProfileErr("Could not upload that image — try a smaller one.");
  }

  async function saveProfile() {
    if (savingProfile) return;
    setProfileMsg(null);
    setProfileErr(null);
    const uname = username.trim().toLowerCase();
    const dname = displayName.trim();
    if (!USERNAME_RE.test(uname)) {
      setProfileErr(
        "Username must be 3–24 characters: lowercase letters, numbers, underscores."
      );
      return;
    }
    if (!dname) {
      setProfileErr("Display name can't be empty.");
      return;
    }
    setSavingProfile(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("coterie_profiles")
      .update({
        username: uname,
        display_name: dname,
        bio: bio.trim().slice(0, 300) || null,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);
    if (error) {
      setProfileErr(
        error.code === "23505"
          ? "That username is already taken."
          : "Could not save — please try again."
      );
    } else {
      // Keep auth metadata in sync so the header greeting matches.
      await supabase.auth.updateUser({
        data: { username: uname, display_name: dname },
      });
      setProfileMsg("Profile saved.");
    }
    setSavingProfile(false);
  }

  async function changePassword() {
    if (savingPw) return;
    setPwMsg(null);
    setPwErr(null);
    if (newPw.length < 8) {
      setPwErr("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== newPw2) {
      setPwErr("New passwords don't match.");
      return;
    }
    if (!currentPw) {
      setPwErr("Enter your current password to confirm it's you.");
      return;
    }
    setSavingPw(true);
    const supabase = supabaseBrowser();
    // Security check: re-authenticate with the current password before
    // allowing any change. A stolen open session can't silently rotate the
    // password without knowing it.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPw,
    });
    if (reauthErr) {
      setPwErr("Current password is incorrect.");
      setSavingPw(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwErr(
        error.message.includes("different")
          ? "New password must be different from the current one."
          : "Could not change the password — please try again."
      );
    } else {
      setPwMsg("Password changed.");
      setCurrentPw("");
      setNewPw("");
      setNewPw2("");
    }
    setSavingPw(false);
  }

  async function savePrefs(next: Prefs) {
    setPrefs(next);
    setPrefsMsg(null);
    setSavingPrefs(true);
    const { error } = await supabaseBrowser()
      .from("coterie_notification_prefs")
      .upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() });
    setSavingPrefs(false);
    setPrefsMsg(error ? "Could not save — try again." : "Saved.");
  }

  async function toggleBanner(on: boolean) {
    if (on && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPrefsMsg("Allow notifications in your browser to turn this on.");
        return;
      }
    }
    await savePrefs({ ...prefs, banner_enabled: on });
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page max-w-2xl py-10">
        {state === "checking" && <p className="text-ink/50">Loading…</p>}

        {state === "denied" && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <h1 className="font-serif text-3xl font-semibold">
              Sign in to manage your account
            </h1>
            <a
              href="/auth"
              className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
            >
              Sign in
            </a>
          </div>
        )}

        {state === "ready" && (
          <>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Settings
            </h1>

            {/* ---------- Profile ---------- */}
            <Section title="Profile">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-clay/25 via-cream to-moss/25"
                  aria-label="Change profile photo"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Your profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-2xl font-semibold text-ink/60">
                      {(displayName || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="absolute inset-0 grid place-items-center bg-black/0 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                    Change
                  </span>
                </button>
                <div className="text-sm text-ink/60">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="font-semibold text-clay hover:underline"
                  >
                    Upload a photo
                  </button>
                  {avatarUrl && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="text-ink/50 hover:text-ink"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void pickAvatar(f);
                    e.target.value = "";
                  }}
                />
              </div>

              <Field label="Display name">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  className="input"
                />
              </Field>
              <Field label="Username">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={24}
                  className="input"
                />
              </Field>
              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="A line or two about you…"
                  className="input resize-none"
                />
              </Field>

              {profileErr && <Note kind="err">{profileErr}</Note>}
              {profileMsg && <Note kind="ok">{profileMsg}</Note>}
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="mt-3 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
              <p className="mt-2 text-xs text-ink/45">
                Your public profile:{" "}
                <a
                  href={`/u/${username}`}
                  className="font-semibold text-clay hover:underline"
                >
                  coterie / @{username}
                </a>
              </p>
            </Section>

            {/* ---------- Security ---------- */}
            <Section title="Security">
              <p className="text-sm text-ink/60">
                Signed in as <strong>{email}</strong>. To change your password,
                confirm the current one first.
              </p>
              <Field label="Current password">
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  className="input"
                />
              </Field>
              <Field label="New password (min. 8 characters)">
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  className="input"
                />
              </Field>
              <Field label="Repeat new password">
                <input
                  type="password"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                  autoComplete="new-password"
                  className="input"
                />
              </Field>
              {pwErr && <Note kind="err">{pwErr}</Note>}
              {pwMsg && <Note kind="ok">{pwMsg}</Note>}
              <button
                type="button"
                onClick={changePassword}
                disabled={savingPw}
                className="mt-3 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
              >
                {savingPw ? "Checking…" : "Change password"}
              </button>
            </Section>

            {/* ---------- Notifications ---------- */}
            <Section title="Notifications">
              <p className="text-sm text-ink/60">
                Choose what lands in your bell — and what reaches you outside
                the app.
              </p>

              <Toggle
                label="Comments on my posts"
                checked={prefs.inapp_comments}
                onChange={(v) => savePrefs({ ...prefs, inapp_comments: v })}
              />
              <Toggle
                label="New posts in my communities"
                checked={prefs.inapp_community_posts}
                onChange={(v) =>
                  savePrefs({ ...prefs, inapp_community_posts: v })
                }
              />
              <Toggle
                label="Someone joins my community"
                checked={prefs.inapp_joins}
                onChange={(v) => savePrefs({ ...prefs, inapp_joins: v })}
              />
              <Toggle
                label="New messages about listings"
                checked={prefs.inapp_messages}
                onChange={(v) => savePrefs({ ...prefs, inapp_messages: v })}
              />

              <div className="mt-4 border-t border-black/5 pt-4">
                <Toggle
                  label="Banner alerts on this device"
                  hint="Pops up a system notification while Coterie is open."
                  checked={prefs.banner_enabled}
                  onChange={(v) => void toggleBanner(v)}
                />
              </div>

              <div className="mt-4 border-t border-black/5 pt-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Email
                </p>
                <Toggle
                  label="Email me when someone joins my community"
                  checked={prefs.email_joins}
                  onChange={(v) => savePrefs({ ...prefs, email_joins: v })}
                />
                <Toggle
                  label="Email me about new messages on my listings"
                  checked={prefs.email_listing_messages}
                  onChange={(v) =>
                    savePrefs({ ...prefs, email_listing_messages: v })
                  }
                />
              </div>

              {prefsMsg && (
                <Note kind={prefsMsg === "Saved." ? "ok" : "err"}>
                  {savingPrefs ? "Saving…" : prefsMsg}
                </Note>
              )}
            </Section>

            {/* ---------- My content ---------- */}
            <Section title="My content">
              <p className="text-sm text-ink/60">
                Everything you&apos;ve made — open any item to edit or delete
                it.
              </p>
              {myCommunities.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Communities
                  </p>
                  <ul className="mt-1 space-y-1">
                    {myCommunities.map((c) => (
                      <li key={c.id}>
                        <a
                          href={`/c/${c.id}`}
                          className="text-sm font-semibold text-clay hover:underline"
                        >
                          {c.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {myListings.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Listings
                  </p>
                  <ul className="mt-1 space-y-1">
                    {myListings.map((l) => (
                      <li key={l.id}>
                        <a
                          href={`/marketplace/${l.id}`}
                          className="text-sm font-semibold text-clay hover:underline"
                        >
                          {l.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {myCommunities.length === 0 && myListings.length === 0 && (
                <p className="mt-2 text-sm text-ink/45">
                  Nothing yet — start a community or list an item from the home
                  page.
                </p>
              )}
              <p className="mt-3 text-xs text-ink/45">
                Your posts can be edited or deleted right on the post itself.
              </p>
            </Section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-xs font-semibold text-ink/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="mt-2 flex w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-ink/85">{label}</span>
        {hint && <span className="block text-xs text-ink/45">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-moss" : "bg-ink/15"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Note({
  kind,
  children,
}: {
  kind: "ok" | "err";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`mt-3 text-sm font-medium ${
        kind === "ok" ? "text-moss" : "text-clay"
      }`}
    >
      {children}
    </p>
  );
}
