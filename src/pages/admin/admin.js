import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import instance from '../../axios/instance';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/get-all-users');
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleDelete = async (user_id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await instance.delete(`/delete-user/${user_id}`);
    fetchUsers();
  };

  const handleSaveEdit = async () => {
    await instance.put(`/update-user/${editUser.user_id}`, editUser);
    setEditUser(null);
    fetchUsers();
  };

  const handleAddUser = async () => {
    await instance.post('/create-user', newUser);
    setAddDialogOpen(false);
    setNewUser({ name: '', email: '', password: '', role: 'user' });
    fetchUsers();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>User Management</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => setAddDialogOpen(true)} sx={{ mb: 2 }}>Add User</Button>
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
                  <IconButton onClick={() => handleEdit(user)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(user.user_id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={editUser?.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={editUser?.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Role" value={editUser?.role || ''} onChange={e => setEditUser({ ...editUser, role: e.target.value })} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Role" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
