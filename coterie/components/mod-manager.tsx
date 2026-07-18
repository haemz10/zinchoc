"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Member = { id: string; username: string; display_name: string };

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// Community owner tool: promote members to moderator (they can then delete
// posts/comments inside this community — enforced by RLS, not just UI).
export function ModManager({
  communityId,
  ownerId,
}: {
  communityId: string;
  ownerId: string | null;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [mods, setMods] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const isOwner = Boolean(userId && ownerId && userId === ownerId);

  async function load() {
    const supabase = supabaseBrowser();
    const [{ data: ms }, { data: modRows }] = await Promise.all([
      supabase
        .from("coterie_memberships")
        .select(
          "profile:coterie_profiles!coterie_memberships_user_id_fkey(id,username,display_name)"
        )
        .eq("community_id", communityId),
      supabase
        .from("coterie_community_mods")
        .select("user_id")
        .eq("community_id", communityId),
    ]);
    const list = ((ms as unknown[]) ?? [])
      .map((r) => one((r as { profile: unknown }).profile) as Member | null)
      .filter((m): m is Member => Boolean(m) && m!.id !== ownerId);
    setMembers(list);
    setMods(new Set(((modRows ?? []) as { user_id: string }[]).map((r) => r.user_id)));
  }

  if (!isOwner) return null;

  async function toggleMod(m: Member) {
    if (busyId) return;
    setBusyId(m.id);
    const supabase = supabaseBrowser();
    if (mods.has(m.id)) {
      await supabase
        .from("coterie_community_mods")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", m.id);
      setMods((s) => {
        const n = new Set(s);
        n.delete(m.id);
        return n;
      });
    } else {
      await supabase
        .from("coterie_community_mods")
        .insert({ community_id: communityId, user_id: m.id, added_by: userId });
      setMods((s) => new Set(s).add(m.id));
    }
    setBusyId(null);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load();
        }}
        className="text-xs font-semibold text-moss hover:underline"
      >
        {open ? "Close moderators" : "Manage moderators"}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-black/5 bg-white p-3">
          <p className="text-xs text-ink/55">
            Moderators can remove posts and comments in this community.
          </p>
          {members.length === 0 ? (
            <p className="mt-2 text-xs text-ink/45">
              No other members yet — invite people first.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3"
                >
                  <a
                    href={`/u/${m.username}`}
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {m.display_name}{" "}
                    <span className="text-ink/45">@{m.username}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleMod(m)}
                    disabled={busyId === m.id}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                      mods.has(m.id)
                        ? "bg-moss/15 text-moss hover:bg-moss/25"
                        : "border border-ink/15 text-ink/60 hover:border-ink/40"
                    }`}
                  >
                    {mods.has(m.id) ? "Moderator ✓" : "Make moderator"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
