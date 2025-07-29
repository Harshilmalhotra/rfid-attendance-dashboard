import React, { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
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
  Avatar,
  Divider,
  alpha,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  Login,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Person,
  Assignment,
  Notifications,
  Campaign,
  AdminPanelSettings,
} from "@mui/icons-material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useColorMode } from "@/context/ColorModeContext";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sidebarRef = useRef(null);
  const [open, setOpen] = useState(!isMobile);
  const [isAdmin, setIsAdmin] = useState(false);

  const publicPages = [
    { title: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  ];

  const protectedPages = [
    { title: "Attendance", icon: <Assignment />, path: "/attendance" },
    { title: "Users", icon: <ManageAccountsIcon />, path: "/users" },
    { title: "Profile", icon: <Person />, path: "/profile" },
    { title: "Notifications", icon: <Notifications />, path: "/notifications" },
  ];

  // Add broadcast and admin management pages for admins only
  const adminPages = isAdmin ? [
    { title: "Broadcast", icon: <Campaign />, path: "/broadcast" },
    { title: "Admin Management", icon: <AdminPanelSettings />, path: "/admin-management" },
  ] : [];

  const pages = user ? [...publicPages, ...protectedPages, ...adminPages] : publicPages;

  useEffect(() => {
    // Check if user is admin based on email
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('admin')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .single();
          
          if (!error && data) {
            setIsAdmin(true);
          }
        } catch (error) {
          // Not an admin or error checking
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && isMobile && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, open]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const isActive = (path) => pathname === path;

  const renderListItem = (page) => (
    <Tooltip title={!open ? page.title : ""} placement="right" arrow>
      <ListItem 
        disablePadding 
        sx={{ 
          display: 'block',
          mb: 0.5,
        }}
      >
        <ListItemButton
          onClick={() => {
            router.push(page.path);
            if (isMobile) setOpen(false);
          }}
          selected={isActive(page.path)}
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            borderRadius: 2,
            mx: 1,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: isActive(page.path) ? '4px' : '0px',
              height: '70%',
              backgroundColor: 'primary.main',
              borderRadius: '0 4px 4px 0',
              transition: 'width 0.3s ease',
            },
            '&:hover': {
              backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.04),
              '&::before': {
                width: '4px',
              },
            },
            '&.Mui-selected': {
              backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.08),
              '&:hover': {
                backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.12),
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
              color: isActive(page.path) ? 'primary.main' : 'text.secondary',
              transition: 'color 0.3s ease',
            }}
          >
            {page.icon}
          </ListItemIcon>
          <ListItemText 
            primary={page.title} 
            sx={{ 
              opacity: open ? 1 : 0,
              color: isActive(page.path) ? 'primary.main' : 'text.primary',
              '& .MuiTypography-root': {
                fontWeight: isActive(page.path) ? 600 : 400,
                fontSize: '0.875rem',
              },
            }} 
          />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );

  return (
    <>
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: mode === 'dark' ? '#1a1d29' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        >
          <Toolbar>
            <IconButton 
              edge="start" 
              onClick={() => setOpen(true)}
              sx={{ 
                mr: 2,
                color: mode === 'dark' ? '#fff' : '#000',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              RFID Attendance
            </Typography>
            <IconButton 
              onClick={toggleColorMode} 
              sx={{ color: mode === 'dark' ? '#fff' : '#000' }}
            >
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
          width: open ? 280 : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? 280 : 72,
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
            backgroundColor: mode === 'dark' ? '#1a1d29' : '#ffffff',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box ref={sidebarRef} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box 
            sx={{ 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 64,
            }}
          >
            {open && (
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RFID System
              </Typography>
            )}
            <IconButton 
              onClick={() => setOpen(!open)}
              sx={{
                ml: open ? 0 : 'auto',
                mr: open ? 0 : 'auto',
                backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.04),
                '&:hover': {
                  backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.08),
                },
              }}
            >
              {open ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Box>

          {/* User Profile Section */}
          {user && (
            <>
              <Box 
                sx={{ 
                  px: 2,
                  pb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar 
                  sx={{ 
                    width: open ? 40 : 32,
                    height: open ? 40 : 32,
                    backgroundColor: 'primary.main',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user.email?.[0]?.toUpperCase()}
                </Avatar>
                {open && (
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.email?.split('@')[0]}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mx: 2, mb: 2 }} />
            </>
          )}

          {/* Navigation Items */}
          <List sx={{ flexGrow: 1, pt: 0 }}>
            {pages.map((page) => renderListItem(page))}
          </List>

          {/* Bottom Actions */}
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ p: 1 }}>
            <Tooltip title={!open ? "Toggle Theme" : ""} placement="right" arrow>
              <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={toggleColorMode}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.04),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Toggle Theme" 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      '& .MuiTypography-root': {
                        fontSize: '0.875rem',
                      },
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>

            {user ? (
              <Tooltip title={!open ? "Logout" : ""} placement="right" arrow>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      mx: 1,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.04),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit',
                      }}
                    >
                      <Logout />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Logout" 
                      sx={{ 
                        opacity: open ? 1 : 0,
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem',
                          color: 'inherit',
                        },
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ) : (
              <Tooltip title={!open ? "Login" : ""} placement="right" arrow>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => router.push('/auth')}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      mx: 1,
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha(mode === 'dark' ? '#fff' : '#000', 0.04),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit',
                      }}
                    >
                      <Login />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Login" 
                      sx={{ 
                        opacity: open ? 1 : 0,
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem',
                          color: 'inherit',
                        },
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;