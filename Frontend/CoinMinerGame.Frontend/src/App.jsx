import { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Toaster, toast } from "react-hot-toast";
import AuthForm from "./components/AuthForm";
import GameDashboard from "./components/GameDashboard";
import { setupResponseInterceptor } from "./services/apiClient";

const BASE_HOST = "http://localhost:7238";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("coin_miner_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [connection, setConnection] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("coin_miner_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    if (connection) {
      connection.stop();
      setConnection(null);
    }
    setUser(null);
    localStorage.removeItem("coin_miner_user");
    toast.success("You have been logged out.");
  };

  useEffect(() => {
    setupResponseInterceptor(handleLogout);
  }, []);

  useEffect(() => {
    if (user?.token) {
      const conn = new HubConnectionBuilder()
        .withUrl(`${BASE_HOST}/gamehub?access_token=${user.token}`)
        .withAutomaticReconnect()
        .build();

      conn
        .start()
        .then(() => {
          console.log("SignalR Connected!");
          setConnection(conn);
        })
        .catch((err) => console.error("SignalR Connection Error: ", err));

      return () => {
        conn.stop();
      };
    } else {
      if (connection) {
        connection.stop();
        setConnection(null);
      }
    }
  }, [user]);

  return (
    <div className="galaxy-bg min-h-screen flex flex-col font-sans text-slate-200">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4200,
          style: {
            background: "#0f1729",
            color: "#e2e8f0",
            border: "1px solid rgba(56,189,248,0.35)",
          },
          success: {
            iconTheme: {
              primary: "#f59e0b",
              secondary: "#0f172a",
            },
          },
        }}
      />

      <header className="relative z-10 flex flex-col items-center gap-3 px-6 pt-10 pb-6 text-center sm:pt-12">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-[0.4em] text-cyan-200/80 border border-cyan-400/40 rounded-full bg-cyan-500/10">
          Group 14
        </span>
        <h1 className="font-arcade text-2xl sm:text-3xl md:text-4xl text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.45)]">
          Idle Coin Miner
        </h1>
        <p className="max-w-xl text-sm sm:text-base text-slate-300/80">
          Charge up your rigs, activate boosters and climb the galactic
          leaderboard powered by .NET, React and Redis.
        </p>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/70 p-4 sm:p-6 shadow-[0_15px_40px_rgba(8,47,73,0.45)] backdrop-blur-xl">
            {user?.token ? (
              <GameDashboard
                user={user}
                connection={connection}
                onLogout={handleLogout}
              />
            ) : (
              <AuthForm onAuth={handleLogin} />
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-6 text-center text-xs text-slate-500">
        <p>Build, boost and mine your way to the top. Stay greedy, miner.</p>
      </footer>
    </div>
  );
}

export default App;
