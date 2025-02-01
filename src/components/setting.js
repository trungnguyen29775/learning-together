import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

const Setting = () => {
    const [target, setTarget] = useState('findTutor');
    const [notifications, setNotifications] = useState(true);
    const [privacy, setPrivacy] = useState('public');

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            console.log('Account deleted');
        }
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = e.target;
        if (newPassword.value !== confirmPassword.value) {
            alert('New passwords do not match!');
            return;
        }
        console.log('Password changed:', { currentPassword: currentPassword.value, newPassword: newPassword.value });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
            }}
        >
            <Card
                sx={{
                    width: '70%',
                    maxWidth: 600,
                    padding: 3,
                    boxShadow: 3,
                    borderRadius: 2,
                    marginTop: '160px',
                }}
            >
                <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Settings
                </Typography>

                {/* Notifications */}
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <Typography>Enable Notifications</Typography>
                    <Switch
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        sx={{ marginLeft: 'auto' }}
                    />
                </Box>

                {/* Privacy Settings */}
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Privacy Settings
                </Typography>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="privacy-label">Privacy</InputLabel>
                    <Select
                        labelId="privacy-label"
                        label="Privacy"
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                    >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="friendsOnly">Friends Only</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ marginY: 2 }} />

                {/* Change Password */}
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Change Password
                </Typography>
                <form onSubmit={handleChangePassword} style={{ marginBottom: 2 }}>
                    <TextField
                        type="password"
                        label="Current Password"
                        name="currentPassword"
                        fullWidth
                        required
                        sx={{ marginBottom: 1 }}
                    />
                    <TextField
                        type="password"
                        label="New Password"
                        name="newPassword"
                        fullWidth
                        required
                        sx={{ marginBottom: 1 }}
                    />
                    <TextField
                        type="password"
                        label="Confirm New Password"
                        name="confirmPassword"
                        fullWidth
                        required
                        sx={{ marginBottom: 2 }}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                        Change Password
                    </Button>
                </form>

                <Divider sx={{ marginY: 2 }} />

                {/* Legal Policies */}
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Legal Policies
                </Typography>
                <Button
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    onClick={() => alert('Redirect to Legal Policies')}
                >
                    View Legal Policies
                </Button>

                {/* Delete Account */}
                <Typography variant="h6" sx={{ marginBottom: 1, color: 'red' }}>
                    Delete Account
                </Typography>
                <Button variant="contained" color="error" fullWidth onClick={handleDeleteAccount}>
                    Delete Account
                </Button>
            </Card>
        </Box>
    );
};

export default Setting;
