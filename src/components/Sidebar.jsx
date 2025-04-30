import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Tooltip,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  Home,
  People,
  Person,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useColorMode } from "../context/ColorModeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Sidebar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const sidebarRef = useRef(null);

  // Sidebar collapsed by default on desktop
  const [open, setOpen] = useState(isMobile);

  const pages = [
    { title: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { title: "Attendance Log", icon: <Home />, path: "/attendance" },
    { title: "User Management", icon: <People />, path: "/users" },
    { title: "Profile", icon: <Person />, path: "/profile" },
  ];

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !isMobile) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return console.error("Logout error:", error.message);
      navigate("/");
    } catch (err) {
      console.error("Unexpected logout error:", err.message);
    }
  };

  return (
    <>
      {/* AppBar for Mobile */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ISD Attendance
            </Typography>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "light" ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: open ? 240 : 60,
            overflowX: "hidden",
            transition: "width 0.3s",
            backgroundColor: mode === "dark" ? "#0c1017" : "#f5f6fa",
            color: mode === "dark" ? "#fff" : "#000",
            borderRight: 0,
          },
        }}
      >
        <Box ref={sidebarRef} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Collapse/Expand Toggle */}
          <Box sx={{ display: "flex", justifyContent: open ? "flex-end" : "center", p: 2 }}>
            <IconButton onClick={() => setOpen(!open)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Nav Items */}
          <List>
            {pages.map((page) => (
              <ListItem key={page.title} disablePadding>
                <Tooltip title={open ? "" : page.title} placement="right">
                  <ListItemButton
                    onClick={() => {
                      navigate(page.path);
                      if (isMobile) setOpen(false);
                    }}
                    sx={{
                      justifyContent: open ? "flex-start" : "center",
                      backgroundColor:
                        location.pathname === page.path
                          ? mode === "dark"
                            ? "#fff"
                            : "#e0e0e0"
                          : "transparent",
                      color: location.pathname === page.path ? "#000" : "#7a8395",
                      "&:hover": {
                        backgroundColor: mode === "dark" ? "#1a1d23" : "#f0f0f0",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === page.path ? "#000" : "#7a8395",
                        minWidth: open ? 40 : "auto",
                      }}
                    >
                      {page.icon}
                    </ListItemIcon>
                    {open && <ListItemText primary={page.title} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          {/* Theme Toggle */}
          <Box sx={{ padding: 2 }}>
            <Tooltip title={open ? "" : "Toggle Theme"} placement="right">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={toggleColorMode}
                  sx={{ justifyContent: open ? "flex-start" : "center" }}
                >
                  <ListItemIcon sx={{ minWidth: open ? 40 : "auto", color: "#7a8395" }}>
                    {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                  </ListItemIcon>
                  {open && <ListItemText primary="Toggle Theme" />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </Box>

          {/* Logout */}
          <Box sx={{ marginTop: "auto", padding: 2 }}>
            <Tooltip title={open ? "" : "Logout"} placement="right">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    justifyContent: open ? "flex-start" : "center",
                    color: "#7a8395",
                    "&:hover": {
                      backgroundColor: mode === "dark" ? "#1a1d23" : "#f0f0f0",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: open ? 40 : "auto", color: "#7a8395" }}>
                    <Logout />
                  </ListItemIcon>
                  {open && <ListItemText primary="Logout" />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
