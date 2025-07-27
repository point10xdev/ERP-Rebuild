type LogLevel = "info" | "error";
import type { LogEntry } from "../types/logger";

export function logMessage(
  level: LogLevel,
  message: string,
  context: string,
  data?: any
) {
  const log: LogEntry = {
    time: new Date().toISOString(),
    context,
    level,
    message,
    data,
  };

  if (level === "error" && data instanceof Error) {
    log.stack = data.stack ?? "";
  }

  // Save to localStorage
  const existingLogs = localStorage.getItem("frontend_log") || "[]";
  const logs: LogEntry[] = JSON.parse(existingLogs);
  logs.push(log);
  // localStorage.setItem("frontend_log", JSON.stringify(logs, null, 2));

  // Also log to console
  if (level === "error") {
    console.error(`[${log.time}] [${context}]`, message, data);
  } else {
    console.log(`[${log.time}] [${context}]`, message, data);
  }
}
