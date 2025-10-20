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
    <div className="bg-slate-900 text-slate-200 h-screen font-sans flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-slate-800 text-slate-200",
          duration: 4000,
        }}
      />

      <header className="text-center p-4 sm:p-6 flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Idle Coin Miner
        </h1>
        <p className="text-slate-400">Powered by .NET, React & Redis</p>
      </header>

      <main className="flex-grow overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
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
      </main>
    </div>
  );
}

export default App;
