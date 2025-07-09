"use client";

import { useEffect, useState } from "react";
import { LogEntry } from "@/types/log";

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [userFilter, setUserFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "500");
      if (userFilter) params.set("user", userFilter);
      if (eventFilter) params.set("event", eventFilter);
      if (startDate) params.set("start", startDate);
      if (endDate) params.set("end", endDate);

      const res = await fetch(`/api/log-connection?${params.toString()}`);
      const data = await res.json();
      setLogs(data.reverse()); // en yeni yukarıda
    } catch (err) {
      setError("Loglar alınamadı");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportCSV = () => {
    const header = ["timestamp", "user", "appId", "event", "meta"];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.user || "",
      l.appId || "",
      l.event,
      JSON.stringify(l.meta || {}),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Uygulama Logları</h1>
      {isLoading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Kullanıcı"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Olay (tümü)</option>
          <option value="connect">connect</option>
          <option value="disconnect">disconnect</option>
          <option value="rehydrate">rehydrate</option>
          <option value="token_expire_disconnect">
            token_expire_disconnect
          </option>
          <option value="publish_start">publish_start</option>
          <option value="publish_success">publish_success</option>
          <option value="publish_error">publish_error</option>
          <option value="content_add">content_add</option>
          <option value="content_update">content_update</option>
          <option value="content_delete">content_delete</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Uygula
        </button>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          CSV İndir
        </button>
      </div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Tarih</th>
              <th className="px-3 py-2 text-left">Kullanıcı</th>
              <th className="px-3 py-2 text-left">App</th>
              <th className="px-3 py-2 text-left">Olay</th>
              <th className="px-3 py-2 text-left">Detay</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-3 py-2">{log.user || "-"}</td>
                <td className="px-3 py-2">{log.appId || "-"}</td>
                <td className="px-3 py-2">{log.event}</td>
                <td className="px-3 py-2 max-w-sm break-all">
                  {log.meta ? JSON.stringify(log.meta) : "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
