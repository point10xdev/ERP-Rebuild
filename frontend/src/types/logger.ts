export interface LogEntry {
  time: string;
  context: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}