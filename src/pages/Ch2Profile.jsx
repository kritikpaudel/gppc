import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundFX from "../components/layout/BackgroundFX";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EVENT_TITLE } from "../data/challenges";
import { useCtfStore } from "../state/useCtfStore";
import { formatTime } from "../lib/time";
import { useActiveTimer } from "../hooks/useActiveTimer";
import { CHALLENGES } from "../data/challenges";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  MapPin,
  Link2,
} from "lucide-react";

const CH2_FLAG = "FL@G{lD0R_M@ster?}";

const PROFILES = Array.from({ length: 12 }).map((_, i) => {
  const id = i + 1;

  const avatar = `https://i.pravatar.cc/300?img=${(id % 70) + 1}`;
  const cover = `https://picsum.photos/seed/cover-${id}/1200/400`;

  const base = {
    id,
    avatar,
    cover,
    name: [
      "Aarav Sharma",
      "Maya Kandel",
      "Nina Rodriguez",
      "Ethan Park",
      "Sofia Ahmed",
      "Lucas Martin",
      "Anika Rai",
      "Kai Nakamura",
      "Ishaan Thapa",
      "Lina Chen",
      "Noah Khan",
      "Priya Joshi",
    ][i],
    username: [
      "aarav.s",
      "maya.k",
      "nina.ro",
      "ethan.p",
      "sofia.a",
      "lucas.m",
      "anika.r",
      "kai.n",
      "ishaan.t",
      "lina.c",
      "noah.k",
      "priya.j",
    ][i],
    verified: id % 3 === 0,
    city: [
      "Kathmandu",
      "Pokhara",
      "Madrid",
      "Seoul",
      "Dubai",
      "Lisbon",
      "Biratnagar",
      "Tokyo",
      "Lalitpur",
      "Taipei",
      "Karachi",
      "Delhi",
    ][i],
    website: [
      "example.com",
      "portfolio.site",
      "mywork.dev",
      "studio.page",
      "bright.bio",
      "northwave.co",
      "hello.world",
      "link.page",
      "about.me",
      "profile.site",
      "links.bio",
      "work.page",
    ][i],
    stats: {
      posts: [18, 33, 12, 45, 28, 21, 14, 39, 26, 30, 17, 24][i],
      followers: [1200, 980, 1540, 2300, 1750, 1100, 860, 3050, 1420, 1990, 910, 1650][i],
      following: [210, 300, 180, 410, 260, 205, 190, 520, 240, 330, 160, 275][i],
    },
    bio: [
      "Ops & automation. Coffee, logs, and late-night deploys.",
      "Designing calm interfaces. Minimal. Focused. Clean.",
      "Travel + street photography. Small moments matter.",
      "Product thinking, tiny experiments, big lessons.",
      "Building people-first culture. Kindness is a strategy.",
      "Data + storytelling. Making dashboards feel human.",
      "CTFs, Linux, and breaking things (responsibly).",
      "Motion + UI. Making pixels feel alive. Always exploring new patterns.",
      "Security analyst. Curious by default.",
      "Frontend dev. Animations & micro-interactions.",
      "Backend + infra. Reliability is my love language.",
      "Learning daily. Shipping weekly.",
    ][i],
  };

  // ✅ ID 8 contains the flag naturally inside bio text (visible)
  if (id === 8) {
    base.bio =
      `Motion + UI. Making pixels feel alive. Always exploring new patterns. ` +
      `Note: ${CH2_FLAG}`;
  }

  return base;
});

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-white/90 font-semibold">{value}</div>
      <div className="text-[11px] text-white/45">{label}</div>
    </div>
  );
}

export default function Ch2Profile() {
  const query = useQuery();
  const navigate = useNavigate();
  const { state, setState, totals } = useCtfStore();
  const ch2 = CHALLENGES.find((c) => c.id === "ch2");
  const ch2Progress = state.challenges["ch2"];

  // ✅ Timer runs while user is on profile pages too
  useActiveTimer({
    running: !!ch2 && !ch2.comingSoon && ch2Progress?.status !== "solved",
    onTick: (dt) => {
      setState((s) => ({
        ...s,
        challenges: {
          ...s.challenges,
          ch2: {
            ...s.challenges.ch2,
            timeMs: (s.challenges.ch2.timeMs || 0) + dt,
          },
        },
      }));
    },
  });
  const totalTime = formatTime(Math.floor(totals.totalTimeMs / 1000));

  const idRaw = query.get("id") || "1";
  const id = Math.max(1, Math.min(12, parseInt(idRaw, 10) || 1));
  const profile = PROFILES.find((p) => p.id === id);

  const prevId = id > 1 ? id - 1 : 1;
  const nextId = id < 12 ? id + 1 : 12;

  if (!profile) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundFX />
        <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />
        <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
          <Card className="p-8" hover={false}>
            <div className="text-white/70">Profile not found.</div>
            <div className="mt-4">
              <Button variant="ghost" onClick={() => navigate("/challenge/ch2")}>
                Back
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <TopBar title={EVENT_TITLE} fullName={state.fullName} points={totals.totalPoints} time={totalTime} />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/challenge/ch2"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Challenge 2
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate(`/challenge/ch2/profile?id=${prevId}`)}
                disabled={id === 1}
                className={id === 1 ? "opacity-50" : ""}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(`/challenge/ch2/profile?id=${nextId}`)}
                disabled={id === 12}
                className={id === 12 ? "opacity-50" : ""}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden" hover={false}>
            <div className="relative">
              <img
                src={profile.cover}
                alt="cover"
                className="h-44 w-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-20 w-20 rounded-3xl object-cover ring-1 ring-white/15"
                      loading="lazy"
                    />
                    {profile.verified && (
                      <div className="absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                        <BadgeCheck className="h-4 w-4 text-emerald-200" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xl font-semibold tracking-tight">{profile.name}</div>
                    <div className="mt-1 text-sm text-white/55">@{profile.username}</div>

                    <div className="mt-3 text-sm text-white/70 leading-relaxed max-w-xl">
                      {profile.bio}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/55">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <MapPin className="h-4 w-4" />
                        {profile.city}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <Link2 className="h-4 w-4" />
                        {profile.website}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Stat label="Posts" value={profile.stats.posts} />
                  <Stat label="Followers" value={profile.stats.followers} />
                  <Stat label="Following" value={profile.stats.following} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={`https://picsum.photos/seed/p-${profile.id}-${idx}/450/450`}
                      alt="post"
                      className="h-28 w-full object-cover hover:scale-[1.02] transition duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  Profile ID: <span className="text-white/70 font-medium">{profile.id}</span>
                </div>

                <Button variant="ghost" onClick={() => navigate("/challenge/ch2")}>
                  Back
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
