"use client";
import { Flame } from "lucide-react";
import { UserProfile } from "@/types";

interface Props {
  user: UserProfile | null;
  streak: number;
}

export function WelcomeSection({ user, streak }: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -right-4 top-12 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-blue-200 text-sm font-medium">{greeting},</p>
          <h2 className="text-2xl font-bold mt-0.5">
            {user?.name?.split(" ")[0] ?? "Student"} 👋
          </h2>
          <p className="text-blue-100 text-sm mt-2 max-w-xs">
            Keep up the momentum! Your consistent practice is building toward exam success.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-center bg-white/20 rounded-xl px-4 py-3 backdrop-blur-sm shrink-0">
          <Flame className="h-6 w-6 text-orange-300 mb-1" />
          <span className="text-2xl font-bold">{streak}</span>
          <span className="text-xs text-blue-100">day streak</span>
        </div>
      </div>
    </div>
  );
}
