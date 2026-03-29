"use client";

import { useMemo } from "react";
import { createTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#6366f1",
            light: "#818cf8",
            dark: "#4f46e5",
          },
          secondary: {
            main: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
          },
          background: {
            default: prefersDarkMode ? "#0f172a" : "#f8fafc",
            paper: prefersDarkMode ? "#1e293b" : "#ffffff",
          },
          text: {
            primary: prefersDarkMode ? "#f8fafc" : "#1e293b",
            secondary: prefersDarkMode ? "#94a3b8" : "#64748b",
          },
          divider: alpha(prefersDarkMode ? "#f8fafc" : "#94a3b8", 0.2),
          error: {
            main: "#ef4444",
          },
          success: {
            main: "#10b981",
          },
          warning: {
            main: "#f59e0b",
          },
          info: {
            main: "#06b6d4",
          },
        },
        typography: {
          fontFamily: "var(--font-inter)",
          h4: {
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h6: {
            fontWeight: 600,
            letterSpacing: "-0.01em",
          },
          subtitle2: {
            fontWeight: 600,
          },
          body2: {
            color: prefersDarkMode ? "#cbd5e1" : "#64748b",
          },
        },
        shape: {
          borderRadius: 4,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 10,
                padding: "8px 20px",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                fontSize: "0.7rem",
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 10,
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode]
  );

  return theme;
}
