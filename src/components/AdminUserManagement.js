import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import instance from '../axios/instance';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/get-all-users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle open/close dialog
  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(user ? { ...user, password: '' } : { name: '', email: '', password: '', role: 'user' });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create user
  const handleCreate = async () => {
    try {
      await instance.post('/create-user', form);
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      alert('Error creating user');
    }
  };

  // Update user
  const handleUpdate = async () => {
    try {
      await instance.put(`/update-user/${editUser.user_id}`, form);
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      alert('Error updating user');
    }
  };

  // Delete user
  const handleDelete = async (user_id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await instance.delete(`/delete-user/${user_id}`);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Admin User Management
      </Typography>
      <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(user)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(user.user_id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Password" name="password" value={form.password} onChange={handleChange} type="password" fullWidth sx={{ mb: 2 }} />
          <TextField label="Role" name="role" value={form.role} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={editUser ? handleUpdate : handleCreate} variant="contained" color="primary">
            {editUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagement;
