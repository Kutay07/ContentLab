export type LogEventType =
  | "connect"
  | "disconnect"
  | "rehydrate"
  | "token_expire_disconnect"
  | "publish_start"
  | "publish_success"
  | "publish_error"
  | "content_add"
  | "content_update"
  | "content_delete";

export interface LogEntry {
  timestamp: number;
  user?: string;
  event: LogEventType;
  appId?: string;
  meta?: Record<string, any>;
}
