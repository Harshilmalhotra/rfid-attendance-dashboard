import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rfid_uid: "",
    reg_number: "",
    role: "",
    phone_number: "",
  });
  const [availableRecords, setAvailableRecords] = useState([]); // Records with null or empty fields

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, rfid_uid, reg_number, role, phone_number, created_at");

    if (error) {
      console.error("Error fetching users:", error.message);
      return;
    }

    setUsers(data);
  };

  const handleOpenDialog = async (user = null) => {
    if (!user) {
      // Search for records where the name field is NULL or empty
      const { data, error } = await supabase
        .from("users")
        .select("id, rfid_uid, name, created_at")
        .or("name.is.null,name.eq.");

      if (error) {
        console.error("Error fetching available records:", error.message);
        return;
      }

      // Convert UTC timestamps to IST
      const recordsWithIST = data.map((record) => ({
        ...record,
        created_at: dayjs.utc(record.created_at).tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss"),
      }));

      setAvailableRecords(recordsWithIST);
    }

    setEditingUser(user);
    setFormData(
      user
        ? {
            name: user.name,
            email: user.email,
            rfid_uid: user.rfid_uid,
            reg_number: user.reg_number,
            role: user.role,
            phone_number: user.phone_number,
          }
        : {
            name: "",
            email: "",
            rfid_uid: availableRecords.length > 0 ? availableRecords[0].rfid_uid : "",
            reg_number: "",
            role: "",
            phone_number: "",
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      rfid_uid: "",
      reg_number: "",
      role: "",
      phone_number: "",
    });
    setAvailableRecords([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      // Update user (excluding rfid_uid)
      const { rfid_uid, ...updateData } = formData;
      const { error } = await supabase.from("users").update(updateData).eq("id", editingUser.id);
      if (error) {
        console.error("Error updating user:", error.message);
        return;
      }
    } else {
      // Create new user
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          email: formData.email,
          reg_number: formData.reg_number,
          role: formData.role,
          phone_number: formData.phone_number,
        })
        .eq("rfid_uid", formData.rfid_uid); // Update the record with the selected RFID UID
      if (error) {
        console.error("Error creating user:", error.message);
        return;
      }
    }
    fetchUsers();
    handleCloseDialog();
  };

  const deleteUser = async (rfid_uid) => {
    console.log("Deleting user with RFID UID:", rfid_uid); // Debugging
    try {
      const { error } = await supabase.from("users").delete().eq("rfid_uid", rfid_uid);
      if (error) {
        console.error("Error deleting user:", error.message);
        return;
      }
      console.log("User deleted successfully");
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  };
  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Sidebar />
      <Container sx={{ padding: 3, flexGrow: 1, marginLeft: "240px" }}>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add User
        </Button>
        <List sx={{ marginTop: 2 }}>
          {users.map((user) => (
            <ListItem
              key={user.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <ListItemText
                primary={`${user.name || "N/A"} (${user.role || "N/A"})`}
                secondary={`Email: ${user.email || "N/A"}, Phone: ${user.phone_number || "N/A"}, RFID: ${user.rfid_uid || "N/A"}, Registration: ${user.reg_number || "N/A"}`}
              />
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ marginRight: 1 }}
                  onClick={() => handleOpenDialog(user)}
                >
                  Edit
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => deleteUser(user.rfid_uid)}>
  Delete
</Button>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Dialog for Create/Edit User */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleFormChange}
            />
            {availableRecords.length > 0 ? (
              <FormControl fullWidth margin="dense">
                <InputLabel id="rfid-uid-label">RFID UID</InputLabel>
                <Select
                  labelId="rfid-uid-label"
                  name="rfid_uid"
                  value={formData.rfid_uid}
                  onChange={handleFormChange}
                >
                  {availableRecords.map((record) => (
                    <MenuItem key={record.id} value={record.rfid_uid}>
                      {`${record.rfid_uid} (Created: ${record.created_at})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                margin="dense"
                name="rfid_uid"
                label="RFID UID"
                type="text"
                fullWidth
                value={formData.rfid_uid}
                onChange={handleFormChange}
                disabled={!!editingUser} // Disable editing for existing users
              />
            )}
            <TextField
              margin="dense"
              name="reg_number"
              label="Registration Number"
              type="text"
              fullWidth
              value={formData.reg_number}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="role"
              label="Role"
              type="text"
              fullWidth
              value={formData.role}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="phone_number"
              label="Phone Number"
              type="number"
              fullWidth
              value={formData.phone_number}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSaveUser} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Users;