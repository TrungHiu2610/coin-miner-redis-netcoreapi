import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../services/apiClient";
import Card from "./Card";

export default function CoinChart({ userId, token, connection }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getCoinHistory();
        const { history } = await res.data;
        setChartData(
          history.map((value, index) => ({
            name: `t-${history.length - index}`,
            coins: value,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [token]);

  useEffect(() => {}, [chartData]);

  useEffect(() => {
    if (!connection) return;
    const handleCoinChanged = (payload) => {
      try {
        const newPoint = { name: "now", coins: payload.coins };
        setChartData((chartData) => [...chartData.slice(1), newPoint]);
      } catch (e) {
        console.error(e);
      }
    };
    connection.on("CoinChanged", handleCoinChanged);
    return () => {
      connection.off("CoinChanged", handleCoinChanged);
    };
  }, [connection, userId]);

  return (
    <Card title="Coin History" className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            stroke="#475569"
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            stroke="#475569"
            tickFormatter={(v) =>
              new Intl.NumberFormat("en", { notation: "compact" }).format(v)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
          />
          <Line
            type="monotone"
            dataKey="coins"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
