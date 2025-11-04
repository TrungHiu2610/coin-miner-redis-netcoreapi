import { useState, useEffect } from "react";
import { api } from "../services/apiClient";
import Card from "./Card";
import Spinner from "./Spinner";

export default function Leaderboard({ connection }) {
  const [topUsers, setTopUsers] = useState(null);

  const fetchTop = async () => {
    try {
      const res = await api.getLeaderboard();
      if (res.status >= 200 && res.status < 300) setTopUsers(await res.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  useEffect(() => {
    fetchTop();
    if (!connection) return;

    // when CoinChanged or LeaderboardChanged event is received, refetch the leaderboard
    connection.on("CoinChanged", fetchTop);
    connection.on("LeaderboardChanged", fetchTop);
    return () => {
      connection.off("LeaderboardChanged", fetchTop);
      connection.off("CoinChanged", fetchTop);
    };
  }, [connection]);

  return (
    <Card title="Galactic Leaderboard">
      {!topUsers ? (
        <Spinner />
      ) : (
        <ol className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-300/80">
          {topUsers.map((u, index) => {
            const badges = ["TOP-1", "TOP-2", "TOP-3"];
            const isTopThree = index < 3;

            return (
              <li
                key={u.userId}
                className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-slate-950/60 px-3 py-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-200">
                    {isTopThree ? badges[index] : `#${index + 1}`}
                  </span>
                  <span className="truncate text-slate-200">{u.username}</span>
                </div>
                <span className="font-semibold text-amber-300">
                  {u.coins.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
