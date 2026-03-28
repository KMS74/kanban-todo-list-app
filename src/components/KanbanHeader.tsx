import {
  Box,
  Typography,
  InputAdornment,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import { ColumnId } from "@/types/task";

interface KanbanHeaderProps {
  totalTasks: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredTotal: number;
  onAddTask: (column: ColumnId) => void;
}

function HeaderTitle({ totalTasks }: { totalTasks: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
        }}
      >
        <DashboardIcon sx={{ color: "#fff", fontSize: 22 }} />
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}
        >
          Kanban Board
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {totalTasks} tasks
        </Typography>
      </Box>
    </Box>
  );
}

function SearchInput({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <TextField
      placeholder="Search tasks..."
      size="small"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      sx={{
        width: { xs: "100%", sm: 600 },
        order: { xs: 3, sm: 0 },
        "& .MuiOutlinedInput-root": {
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          },
          "&.Mui-focused": {
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.15)",
          },
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function AddTaskButton({ onAddTask }: { onAddTask: (col: ColumnId) => void }) {
  return (
    <Tooltip title="Create new task" arrow>
      <IconButton
        onClick={() => onAddTask("backlog")}
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "#fff",
          width: 40,
          height: 40,
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
}

function FilterStatus({
  searchQuery,
  setSearchQuery,
  filteredTotal,
  totalTasks,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredTotal: number;
  totalTasks: number;
}) {
  if (!searchQuery) return null;

  return (
    <Box
      sx={{
        mt: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Showing {filteredTotal} of {totalTasks} tasks
      </Typography>
      <Chip
        label={`"${searchQuery}"`}
        size="small"
        onDelete={() => setSearchQuery("")}
        sx={{
          borderRadius: 2,
          backgroundColor: "rgba(99, 102, 241, 0.08)",
          color: "#6366f1",
          fontWeight: 600,
          "& .MuiChip-deleteIcon": {
            color: "#6366f1",
            "&:hover": { color: "#4f46e5" },
          },
        }}
      />
    </Box>
  );
}

export default function KanbanHeader({
  totalTasks,
  searchQuery,
  setSearchQuery,
  filteredTotal,
  onAddTask,
}: KanbanHeaderProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 2.5,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <HeaderTitle totalTasks={totalTasks} />
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <AddTaskButton onAddTask={onAddTask} />
      </Box>

      <FilterStatus
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTotal={filteredTotal}
        totalTasks={totalTasks}
      />
    </Box>
  );
}
