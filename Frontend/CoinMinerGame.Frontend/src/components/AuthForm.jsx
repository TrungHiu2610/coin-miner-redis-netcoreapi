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
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegister ? "Create Account" : "Login"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegister && (
            <input
              className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          <span
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
