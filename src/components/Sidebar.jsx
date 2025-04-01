import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Brightness4, Brightness7, Logout, Home, People, Person, Dashboard as DashboardIcon } from "@mui/icons-material";
import { useColorMode } from "../context/ColorModeContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [open, setOpen] = useState(!isMobile);

  const pages = [
    { title: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" }, // Added Dashboard
    { title: "Attendance Log", icon: <Home />, path: "/attendance" },
    { title: "User Management", icon: <People />, path: "/users" },
    { title: "Profile", icon: <Person />, path: "/profile" },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked");
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 240,
          backgroundColor: mode === "dark" ? "#0c1017" : "#f5f6fa",
          color: mode === "dark" ? "#fff" : "#000",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Color Mode Toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Box>

        {/* Navigation Links */}
        <List>
          {pages.map((page) => (
            <ListItem key={page.title} disablePadding>
              <ListItemButton
                onClick={() => navigate(page.path)}
                sx={{
                  backgroundColor: location.pathname === page.path ? (mode === "dark" ? "#fff" : "#e0e0e0") : "transparent",
                  color: location.pathname === page.path ? "#000" : "#7a8395",
                  "&:hover": {
                    backgroundColor: mode === "dark" ? "#1a1d23" : "#f0f0f0",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === page.path ? "#000" : "#7a8395",
                  }}
                >
                  {page.icon}
                </ListItemIcon>
                <ListItemText primary={page.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ marginTop: "auto", padding: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                color: "#7a8395",
                "&:hover": {
                  backgroundColor: mode === "dark" ? "#1a1d23" : "#f0f0f0",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#7a8395" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;