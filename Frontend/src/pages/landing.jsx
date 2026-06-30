import React from 'react';
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Stack
} from '@mui/material';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LoginIcon from '@mui/icons-material/Login';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>

            {/* Navigation Bar */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eaeaea' }}>
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 }, py: 1 }}>

                    {/* Brand / Logo */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <VideoCameraFrontIcon sx={{ color: '#FF9839', fontSize: 32 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                            Apna Video Call
                        </Typography>
                    </Stack>

                    {/* Nav Links & Actions */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            color="inherit"
                            onClick={() => navigate("/aljk23")}
                            sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
                        >
                            Join as Guest
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate("/auth")}
                            sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
                        >
                            Register
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate("/auth")}
                            sx={{
                                bgcolor: '#1a1a1a',
                                color: 'white',
                                '&:hover': { bgcolor: '#333' },
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 3
                            }}
                        >
                            Login
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Main Hero Section */}
            <Container
                maxWidth="md"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 12
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 900,
                        color: 'text.primary',
                        lineHeight: 1.2,
                        mb: 3,
                        fontSize: { xs: '2.5rem', md: '4rem' }
                    }}
                >
                    <Box component="span" sx={{ color: '#FF9839' }}>Connect</Box> with your<br /> loved ones.
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 6, fontWeight: 400, maxWidth: 600 }}
                >
                    Cover the distance in an instant with Apna Video Call. High-quality, secure, and seamless meetings for everyone.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/auth")}
                        sx={{
                            bgcolor: '#FF9839',
                            '&:hover': { bgcolor: '#e68a32' },
                            px: 5,
                            py: 1.8,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 8px 16px rgba(255, 152, 57, 0.25)'
                        }}
                    >
                        Get Started for Free
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<GroupAddIcon />}
                        onClick={() => navigate("/aljk23")}
                        sx={{
                            px: 4,
                            py: 1.8,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: '#ddd',
                            color: 'text.primary',
                            '&:hover': { borderColor: '#aaa', bgcolor: '#f5f5f5' }
                        }}
                    >
                        Join as Guest
                    </Button>
                </Stack>
            </Container>

        </Box>
    );
}

export default LandingPage;