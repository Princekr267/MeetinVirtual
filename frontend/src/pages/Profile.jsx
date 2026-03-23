import React, { useContext, useEffect, useState } from 'react';
import {
    Avatar, Box, Button, CircularProgress, Container,
    Divider, Paper, Typography
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from "./components/Navbar"
import EmailIcon from '@mui/icons-material/Email';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "../styles/home.css";

function Profile() {
    const { getUserProfile } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getUserProfile()
            .then(data => setProfile(data))
            .catch(() => navigate('/auth'))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    const profilePhoto = () => {
        alert("Coming Soon!")
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Navbar/>
            <Container maxWidth="sm" sx={{ mt: { xs: 4, md: 8 }, mb: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
                <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, width: '100%', overflow: 'hidden' }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <Avatar onClick={profilePhoto} className='avatar' sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, bgcolor: 'primary.main', fontSize: { xs: 28, sm: 36 }, cursor: 'pointer' }}>
                            {profile?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" fontWeight={600} textAlign="center">{profile?.name}</Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <PersonIcon color="action" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Username</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{profile?.name}</Typography>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <EmailIcon color="action" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{profile?.username}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="flex-end">
                        <Button variant="outlined" color="error" onClick={handleLogout} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            Logout
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}

export default Profile;