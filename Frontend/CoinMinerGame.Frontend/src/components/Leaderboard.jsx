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
    <Card title="🏆 Leaderboard">
      {!topUsers ? (
        <Spinner />
      ) : (
        <ol className="space-y-2">
          {topUsers.map((u, index) => (
            <li
              key={u.userId}
              className="flex justify-between items-baseline text-sm p-2 rounded-md bg-slate-900/50"
            >
              <span className="font-semibold truncate">
                {index + 1}. {u.username}
              </span>
              <span className="font-bold text-amber-400">
                {u.coins.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
