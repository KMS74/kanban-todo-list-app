export type ColumnId = "backlog" | "in_progress" | "review" | "done";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  column: ColumnId;
  priority: Priority;
  createdAt: string;
  order?: number;
}

export interface ColumnConfig {
  id: ColumnId;
  title: string;
  color: string;
  gradient: string;
}

export const COLUMNS: ColumnConfig[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  {
    id: "review",
    title: "In Review",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
  },
  {
    id: "done",
    title: "Done",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  },
];

export const PRIORITY_CONFIG = {
  high: { label: "High", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" },
  medium: {
    label: "Medium",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  low: { label: "Low", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)" },
};
