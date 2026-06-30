import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext.jsx'; // Adjust path if needed
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    const [userName, setuserName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(0); // 0 = Login, 1 = Register
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    const handleAuth = async (e) => {
        if (e && e.preventDefault) e.preventDefault(); // Prevent standard page refreshes

        try {
            if (formState === 0) {
                await handleLogin(userName, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, userName, password);
                setMessage(result || "Registration Successful!");
                setOpen(true);
                setError("");
                setFormState(0); // Switch user to Login mode automatically
                setuserName("");
                setPassword("");
                setName("");
            }
        } catch (err) {
            console.error(err);
            let errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant={formState === 0 ? "contained" : "text"}
                                onClick={() => { setFormState(0); setError(""); }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={formState === 1 ? "contained" : "text"}
                                onClick={() => { setFormState(1); setError(""); }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        {/* Native Form submit behavior wired directly into handleAuth layout */}
                        <Box component="form" onSubmit={handleAuth} noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="userName"
                                label="userName"
                                name="userName"
                                value={userName}
                                autoFocus={formState === 0}
                                onChange={(e) => setuserName(e.target.value)}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && <p style={{ color: "red", margin: "8px 0", fontSize: "0.875rem" }}>{error}</p>}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                message={message}
            />
        </ThemeProvider>
    );
}