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
  Menu as MenuIcon,
} from "@mui/icons-material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useColorMode } from "@/context/ColorModeContext";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const Sidebar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const sidebarRef = useRef(null);
  const [open, setOpen] = useState(isMobile);

  const pages = [
    { title: "Dashboard", icon: <Home />, path: "/dashboard" },
    { title: "Attendance Log", icon: <TableChartIcon />, path: "/attendance" },
    { title: "User Management", icon: <ManageAccountsIcon />, path: "/users" },
    { title: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && !isMobile) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/auth");
    else console.error("Logout error:", error.message);
  };

  const renderListItem = (title, icon, onClick) => (
    <Tooltip title={open ? "" : title} placement="right">
      <ListItem disablePadding>
        <ListItemButton
          onClick={onClick}
          sx={{
            justifyContent: open ? "flex-start" : "center",
            color: "#7a8395",
            "&:hover": {
              backgroundColor: mode === "dark" ? "#1a1d23" : "#f0f0f0",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: open ? 40 : "auto", color: "inherit" }}>
            {icon}
          </ListItemIcon>
          {open && <ListItemText primary={title} />}
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );

  return (
    <>
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
          {/* Toggle Sidebar Button */}
          <Box sx={{ display: "flex", justifyContent: open ? "flex-end" : "center", p: 2 }}>
            <IconButton onClick={() => setOpen(!open)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Nav Items */}
          <List>
            {pages.map((page) =>
              renderListItem(page.title, page.icon, () => {
                router.push(page.path);
                if (isMobile) setOpen(false);
              })
            )}
          </List>

          {/* Bottom actions */}
          <Box sx={{ mt: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            {renderListItem("Toggle Theme", mode === "light" ? <Brightness4 /> : <Brightness7 />, toggleColorMode)}
            {renderListItem("Logout", <Logout />, handleLogout)}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
