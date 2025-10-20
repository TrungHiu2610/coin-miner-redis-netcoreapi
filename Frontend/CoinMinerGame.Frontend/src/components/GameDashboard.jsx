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
        toast(msg, { icon: "🏆" });
      }
      // notify when user has earned a offline coins reward
      else if (
        msg &&
        typeof msg === "string" &&
        msg.trim() !== "" &&
        msg.includes("offline")
      ) {
        toast(msg, { icon: "💰" });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Welcome, <span className="text-cyan-400">{userState.username}</span>!
        </h2>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:col-start-2 space-y-6">
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

        <div className="lg:col-span-1 lg:row-start-1 lg:col-start-1 space-y-6">
          <Inventory
            token={user.token}
            currentCoins={userState.coins}
            onPurchase={fetchUserState}
          />
        </div>

        <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3 space-y-6">
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
