import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/AuthContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    TextField,
    Box,
    Container,
    Grid,
    Stack
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

function Home() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        // Prevent joining if the input is empty or just spaces
        if (!meetingCode.trim()) return;

        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f6f8' }}>

            {/* Top Navigation Bar */}
            <AppBar position="static" color="inherit" elevation={1}>
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 } }}>
                    {/* Brand / Logo */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <VideoCameraFrontIcon color="primary" fontSize="large" />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Apna Video Call
                        </Typography>
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            color="inherit"
                            startIcon={<RestoreIcon />}
                            onClick={() => navigate("/history")}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            History
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Main Hero Section */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 8 }}>
                <Grid container spacing={6} alignItems="center">

                    {/* Left Panel: Copy and Inputs */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ maxWidth: 500 }}>
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{ fontWeight: 800, mb: 2, color: 'text.primary', lineHeight: 1.2 }}
                            >
                                Quality Video Calls,<br /> Just Like Quality Education.
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                                Connect, collaborate, and celebrate from anywhere. Enter a meeting code below to join your room instantly.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Enter Meeting Code"
                                    value={meetingCode}
                                    onChange={e => setMeetingCode(e.target.value)}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleJoinVideoCall}
                                    disabled={!meetingCode.trim()}
                                    sx={{
                                        px: 4,
                                        py: { xs: 1.5, sm: 0 }, // matches TextField height on desktop
                                        fontWeight: 'bold',
                                        borderRadius: 1.5,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Right Panel: Illustration */}
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src="/logo3.png"
                            alt="Video Call Illustration"
                            sx={{
                                width: '100%',
                                maxWidth: 550,
                                height: 'auto',
                                display: 'block',
                                mx: 'auto',
                                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.08))'
                            }}
                        />
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}

export default withAuth(Home);