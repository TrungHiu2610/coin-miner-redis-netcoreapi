import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../services/apiClient";

import CoinCounter from "./CoinCounter";
import MineButton from "./MineButton";
import Leaderboard from "./Leaderboard";
import Inventory from "./Inventory";
import BoostPanel from "./BoostPanel";
import CoinChart from "./CoinChart";
import Spinner from "./Spinner";

export default function GameDashboard({ user, connection, onLogout }) {
  const [userState, setUserState] = useState(null);

  const fetchUserState = async () => {
    try {
      const response = await api.getUserState();
      setUserState(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        onLogout();
        localStorage.removeItem("coin_miner_user");
        return;
      }
      console.error("Failed to fetch user state (non-auth error)", err);
    }
  };

  useEffect(() => {
    fetchUserState();
  }, [user.token]);

  useEffect(() => {
    if (!connection) return;

    const handleCoinChanged = (payload) => {
      try {
        if (payload.userId === user.userId) {
          setUserState((currentState) => ({
            ...currentState,
            coins: payload.coins,
            coins_per_second: payload.coinsPerSecond,
          }));
        }
      } catch (e) {
        console.error("Error parsing CoinChanged payload", e);
      }
    };

    const handleLeaderboardChanged = (msg) => {
      if (
        msg &&
        typeof msg === "string" &&
        msg.trim() !== "" &&
        msg.includes("leader")
      ) {
        toast(msg, { icon: "!!" });
      }
      // notify when user has earned an offline coins reward
      else if (
        msg &&
        typeof msg === "string" &&
        msg.trim() !== "" &&
        msg.includes("offline")
      ) {
        toast(msg, { icon: "::" });
      }
    };

    connection.on("CoinChanged", handleCoinChanged);
    connection.on("LeaderboardChanged", handleLeaderboardChanged);
    connection.on("BoostActivated", fetchUserState);
    connection.on("PurchaseMade", fetchUserState);

    return () => {
      connection.off("CoinChanged", handleCoinChanged);
      connection.off("LeaderboardChanged", handleLeaderboardChanged);
      connection.off("BoostActivated", fetchUserState);
      connection.off("PurchaseMade", fetchUserState);
    };
  }, [connection, user.userId]);

  if (!userState) return <Spinner />;

  return (
    <div className="space-y-6 text-slate-200">
      <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/70 px-6 py-5 shadow-[0_10px_30px_rgba(8,47,73,0.45)]">
        <div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">
            Welcome,{" "}
            <span className="text-cyan-300">{userState.username}</span>
          </h2>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border border-red-400/40 bg-red-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-red-200 transition hover:border-red-400 hover:bg-red-500/30"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1 lg:col-start-2">
          <CoinCounter
            coins={userState.coins}
            cps={userState.coins_per_second}
          />
          <MineButton token={user.token} />
          <BoostPanel
            currentCoins={userState.coins}
            onPurchase={fetchUserState}
          />
        </div>

        <div className="space-y-6 lg:col-span-1 lg:col-start-1 lg:row-start-1">
          <Inventory
            token={user.token}
            currentCoins={userState.coins}
            onPurchase={fetchUserState}
          />
        </div>

        <div className="space-y-6 lg:col-span-1 lg:col-start-3 lg:row-start-1">
          <Leaderboard connection={connection} />
          <CoinChart
            userId={user.userId}
            token={user.token}
            connection={connection}
          />
        </div>
      </div>
    </div>
  );
}
