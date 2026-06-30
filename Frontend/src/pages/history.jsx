import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Card, Box, CardContent, Typography, IconButton, Container,
    Grid, AppBar, Toolbar, Snackbar, Alert, CircularProgress,
    Tooltip, Button, Stack, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideocamIcon from '@mui/icons-material/Videocam';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getHistoryOfUser();

                // FIX: Ensure meetings is ALWAYS an array, even if API returns null/undefined
                setMeetings(Array.isArray(history) ? history : []);

            } catch (error) {
                console.error("Error fetching history:", error);
                setSnackbar({
                    open: true,
                    message: 'Failed to load meeting history. Please try again.',
                    severity: 'error'
                });
                setMeetings([]); // Fallback to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return "Invalid Date";
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbar({
            open: true,
            message: 'Meeting code copied to clipboard!',
            severity: 'success'
        });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f7', pb: 6 }}>
            {/* Minimalist Navigation Bar */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e5ea' }}>
                <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                    <IconButton
                        edge="start"
                        onClick={() => routeTo("/home")}
                        sx={{ color: '#1c1c1e', mr: 2, '&:hover': { bgcolor: '#f2f2f7' } }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: '#1c1c1e' }}>
                        Meeting History
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                {loading ? (
                    // Loading State
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress sx={{ color: '#1c1c1e' }} />
                    </Box>
                ) : (!meetings || meetings.length === 0) ? (
                    // FIX: Bulletproof Empty State Check
                    <Box sx={{ textAlign: 'center', mt: 10 }}>
                        <EventIcon sx={{ fontSize: 64, color: '#a1a1a6', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1c1c1e', mb: 1 }}>
                            No past meetings
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            You haven't joined any video calls yet.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => routeTo("/home")}
                            sx={{ mt: 3, bgcolor: '#1c1c1e', color: 'white', '&:hover': { bgcolor: '#3a3a3c' }, textTransform: 'none', px: 4, py: 1.5, borderRadius: 2 }}
                        >
                            Return Home
                        </Button>
                    </Box>
                ) : (
                    // History Grid
                    <Grid container spacing={3}>
                        {meetings.map((meeting, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        border: '1px solid #e5e5ea',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: '#d1d1d6',
                                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Chip
                                                icon={<VideocamIcon fontSize="small" />}
                                                label="Video Call"
                                                size="small"
                                                sx={{ bgcolor: '#f2f2f7', color: '#1c1c1e', fontWeight: 600, borderRadius: 2 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EventIcon fontSize="inherit" />
                                                {formatDate(meeting.date)}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                                            Meeting Code
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1c1c1e', letterSpacing: '-0.5px', flexGrow: 1 }}>
                                                {meeting.meetingCode}
                                            </Typography>
                                            <Tooltip title="Copy Code">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopy(meeting.meetingCode)}
                                                    sx={{ bgcolor: '#f2f2f7', '&:hover': { bgcolor: '#e5e5ea' } }}
                                                >
                                                    <ContentCopyIcon fontSize="small" sx={{ color: '#1c1c1e' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}