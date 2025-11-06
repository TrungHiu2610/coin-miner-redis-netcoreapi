import { useState } from "react";
import { api } from "../services/apiClient";
import toast from "react-hot-toast";

export default function AuthForm({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (isRegister && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(
      isRegister ? "Registering..." : "Logging in..."
    );

    try {
      const res = isRegister
        ? await api.register(username, password, confirmPassword)
        : await api.login(username, password);

      const data = res.data;

      if (res.status >= 200 && res.status < 300) {
        toast.success(`Welcome, ${data.username || username}!`, {
          id: loadingToast,
        });
        onAuth(data);
      } else {
        toast.error(data.message || "An error occurred.", { id: loadingToast });
      }
    } catch (err) {
      const errorData = err.response?.data;
      toast.error(errorData?.message || "An error occurred.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="holo-card">
        <div className="holo-card__inner p-6 sm:p-8">
          <div className="text-center">
            <h2 className="mt-4 text-2xl sm:text-3xl font-arcade text-amber-300">
              {isRegister ? "Create Account" : "Login"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-slate-300/80">Username</span>
              <input
                className="w-full rounded-lg border border-cyan-400/30 bg-slate-900/60 px-4 py-3 font-medium tracking-wide text-slate-200 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/60"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-slate-300/80">Password</span>
              <input
                className="w-full rounded-lg border border-cyan-400/30 bg-slate-900/60 px-4 py-3 font-medium tracking-wide text-slate-200 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/60"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {isRegister && (
              <label className="block space-y-2 text-sm">
                <span className="text-slate-300/80">Confirm Password</span>
                <input
                  className="w-full rounded-lg border border-cyan-400/30 bg-slate-900/60 px-4 py-3 font-medium tracking-wide text-slate-200 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/60"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="neon-button w-full py-4 text-base tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>
                {isLoading ? "Processing..." : isRegister ? "Register" : "Login"}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
              onClick={() => setIsRegister(!isRegister)}
            >
              <span className="text-xs uppercase tracking-[0.3em]">
                {isRegister ? "Back To Login" : "Create New Account"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
