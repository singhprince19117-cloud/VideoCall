import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import {
    Badge, IconButton, TextField, Button, Box, Paper, Typography, Stack,
    Grid, Tooltip, Dialog, DialogTitle, DialogContent, List, ListItem,
    ListItemIcon, ListItemText, ListItemButton, Snackbar, Alert, Divider,
    Container
} from '@mui/material';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import server from "../environment.js";

const server_url = server;
var connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);

    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([]);

    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        getPermissions();
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) setVideoAvailable(true);
            else setVideoAvailable(false);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) setAudioAvailable(true);
            else setAudioAvailable(false);

            if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
            else setScreenAvailable(false);

            // Fetch stream with current preferred toggle configurations
            updateLocalStream(video, audio);
        } catch (error) {
            console.log(error);
        }
    };

    const updateLocalStream = async (videoState, audioState) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }

            if (videoState || audioState) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoState && videoAvailable,
                    audio: audioState && audioAvailable
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            } else {
                let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }
            }
        } catch (e) {
            console.log("Error updating streams: ", e);
        }
    }

    const toggleLobbyVideo = () => {
        const nextState = !video;
        setVideo(nextState);
        updateLocalStream(nextState, audio);
    };

    const toggleLobbyAudio = () => {
        const nextState = !audio;
        setAudio(nextState);
        updateLocalStream(video, nextState);
    };

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e))
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        });
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            getUserMedia();
        });
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = { socketId: socketListId, stream: event.stream, autoplay: true, playsinline: true };
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                                })
                                .catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let handleVideo = () => setVideo(!video);
    let handleAudio = () => setAudio(!audio);
    let handleScreen = () => setScreen(!screen);
    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { }
        window.location.href = "/";
    }

    useEffect(() => {
        if (screen !== undefined) getDislayMedia();
    }, [screen]);

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, { sender: sender, data: data }]);
        if (socketIdSender !== socketIdRef.current && !showModal) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    }

    let connect = () => {
        if (!username.trim()) return;
        setAskForUsername(false);

        connectToSocketServer();
    }

    const currentUrl = window.location.href;
    const shareMessage = `Join my video meeting: ${currentUrl}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentUrl);
        setSnackbarMessage("Meeting link copied to clipboard!");
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: askForUsername ? '#ffffff' : '#202124' }}>
            {askForUsername ? (

                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f7', p: { xs: 2, md: 4 } }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
                        gridTemplateRows: { xs: 'auto', md: 'auto auto' },
                        gap: 3,
                        width: '100%',
                        maxWidth: 1080
                    }}>


                        <Paper
                            elevation={0}
                            sx={{
                                gridRow: { md: 'span 2' },
                                borderRadius: 6,
                                overflow: 'hidden',
                                border: '1px solid #e5e5ea',
                                bgcolor: '#1c1c1e',
                                position: 'relative',
                                aspectRatio: { xs: '4/3', md: 'auto' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)'
                            }}
                        >
                            {video ? (
                                <Box
                                    component="video"
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <VideocamOffIcon sx={{ fontSize: 64, color: '#636366', mb: 2 }} />
                                    <Typography variant="h6" color="#a1a1a6" fontWeight={500}>
                                        Camera is off
                                    </Typography>
                                </Box>
                            )}


                            <Stack direction="row" spacing={2} sx={{ position: 'absolute', bottom: 32, zIndex: 2 }}>
                                <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"}>
                                    <IconButton
                                        onClick={toggleLobbyAudio}
                                        sx={{
                                            bgcolor: audio ? 'rgba(28, 28, 30, 0.6)' : '#ff453a',
                                            color: 'white',
                                            backdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            '&:hover': { bgcolor: audio ? 'rgba(28, 28, 30, 0.8)' : '#ff3b30' },
                                            p: 2.5,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {audio ? <MicIcon fontSize="medium" /> : <MicOffIcon fontSize="medium" />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={video ? "Turn off Camera" : "Turn on Camera"}>
                                    <IconButton
                                        onClick={toggleLobbyVideo}
                                        sx={{
                                            bgcolor: video ? 'rgba(28, 28, 30, 0.6)' : '#ff453a',
                                            color: 'white',
                                            backdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            '&:hover': { bgcolor: video ? 'rgba(28, 28, 30, 0.8)' : '#ff3b30' },
                                            p: 2.5,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {video ? <VideocamIcon fontSize="medium" /> : <VideocamOffIcon fontSize="medium" />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Paper>


                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 6,
                                p: { xs: 3, md: 5 },
                                border: '1px solid #e5e5ea',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                bgcolor: 'white',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)'
                            }}
                        >
                            <Typography variant="h4" fontWeight="800" letterSpacing="-0.8px" color="#1c1c1e" mb={1}>
                                Ready to join?
                            </Typography>
                            <Typography variant="body1" color="#8e8e93" mb={4} fontWeight={500}>
                                Enter your display name to enter the room.
                            </Typography>

                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f2f2f7',
                                            '& fieldset': { borderColor: 'transparent' },
                                            '&:hover fieldset': { borderColor: '#d1d1d6' },
                                            '&.Mui-focused fieldset': { borderColor: '#1c1c1e', borderWidth: '2px' },
                                            '& input': { py: 2, fontWeight: 500 }
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    disabled={!username.trim()}
                                    onClick={connect}
                                    disableElevation
                                    sx={{
                                        py: 2,
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        bgcolor: '#1c1c1e',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#3a3a3c' },
                                        '&:disabled': { bgcolor: '#e5e5ea', color: '#a1a1a6' }
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </Stack>
                        </Paper>


                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 6,
                                p: { xs: 3, md: 4 },
                                border: '1px solid #e5e5ea',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                bgcolor: '#fafbfc',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)'
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="700" color="#1c1c1e" mb={2}>
                                Share this meeting
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', p: 1, pr: 1.5, borderRadius: 3, border: '1px solid #e5e5ea', mb: 3 }}>
                                <Box sx={{ bgcolor: '#f2f2f7', p: 1.2, borderRadius: 2.5, mr: 1.5, display: 'flex' }}>
                                    <ShareIcon sx={{ fontSize: 20, color: '#8e8e93' }} />
                                </Box>
                                <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1c1c1e', fontWeight: 500, mr: 2 }}>
                                    {currentUrl}
                                </Typography>
                                <Tooltip title="Copy Link">
                                    <IconButton onClick={handleCopy} size="small" sx={{ color: '#1c1c1e', bgcolor: '#f2f2f7', '&:hover': { bgcolor: '#e5e5ea' } }}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                                    component="a" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`} target="_blank"
                                    sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', color: '#1c1c1e', borderColor: '#e5e5ea', fontWeight: 600, py: 1.2, '&:hover': { bgcolor: '#f2f2f7', borderColor: '#d1d1d6' } }}
                                >
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                                    component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank"
                                    sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', color: '#1c1c1e', borderColor: '#e5e5ea', fontWeight: 600, py: 1.2, '&:hover': { bgcolor: '#f2f2f7', borderColor: '#d1d1d6' } }}
                                >
                                    Facebook
                                </Button>
                            </Stack>
                        </Paper>

                    </Box>
                </Box>
            ) : (

                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>


                    <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 2, gap: 2 }}>


                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            gap: 2,
                            overflowY: 'auto',
                            p: 1
                        }}>

                            <Box sx={{ position: 'relative' }}>
                                <Box
                                    component="video"
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                    sx={{
                                        width: '100%',
                                        maxWidth: '600px',
                                        maxHeight: { xs: '30vh', md: '40vh' },
                                        objectFit: 'cover',
                                        borderRadius: 3,
                                        boxShadow: 3,
                                        bgcolor: '#000'
                                    }}
                                />
                                <Typography sx={{ position: 'absolute', bottom: 16, left: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: 1 }}>
                                    You
                                </Typography>
                            </Box>


                            {videos.map((vid) => (
                                <Box key={vid.socketId} sx={{ position: 'relative' }}>
                                    <Box
                                        component="video"
                                        data-socket={vid.socketId}
                                        ref={ref => { if (ref && vid.stream) ref.srcObject = vid.stream; }}
                                        autoPlay
                                        sx={{
                                            width: '100%',
                                            maxWidth: '600px',
                                            maxHeight: { xs: '30vh', md: '40vh' },
                                            objectFit: 'cover',
                                            borderRadius: 3,
                                            boxShadow: 3,
                                            bgcolor: '#000'
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>


                        {showModal && (
                            <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight="bold">In-call messages</Typography>
                                    <IconButton size="small" onClick={() => setModal(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {messages.length !== 0 ? messages.map((item, index) => {
                                        const isMe = item.sender === username;
                                        return (
                                            <Box key={index} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    {isMe ? "You" : item.sender}
                                                </Typography>
                                                <Box sx={{
                                                    bgcolor: isMe ? '#1976d2' : '#f1f3f4',
                                                    color: isMe ? 'white' : 'black',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    borderTopRightRadius: isMe ? 0 : 8,
                                                    borderTopLeftRadius: isMe ? 8 : 0
                                                }}>
                                                    <Typography variant="body2">{item.data}</Typography>
                                                </Box>
                                            </Box>
                                        )
                                    }) : (
                                        <Typography color="text.secondary" textAlign="center" mt={4}>
                                            Messages can only be seen by people in the call.
                                        </Typography>
                                    )}
                                </Box>

                                <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Send a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton color="primary" onClick={sendMessage} edge="end">
                                                    <SendIcon />
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Box>
                            </Paper>
                        )}
                    </Box>


                    <Box sx={{
                        height: 80,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: '#1b1b1b',
                        borderTop: '1px solid #333',
                        px: 3
                    }}>
                        <Tooltip title={audio ? "Turn off microphone" : "Turn on microphone"}>
                            <IconButton onClick={handleAudio} sx={{ bgcolor: audio ? '#3c4043' : '#ea4335', color: 'white', '&:hover': { bgcolor: audio ? '#4f5256' : '#d93025' }, p: 1.5 }}>
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={video ? "Turn off camera" : "Turn on camera"}>
                            <IconButton onClick={handleVideo} sx={{ bgcolor: video ? '#3c4043' : '#ea4335', color: 'white', '&:hover': { bgcolor: video ? '#4f5256' : '#d93025' }, p: 1.5 }}>
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </Tooltip>

                        {screenAvailable && (
                            <Tooltip title={screen ? "Stop presenting" : "Present now"}>
                                <IconButton onClick={handleScreen} sx={{ bgcolor: screen ? '#8ab4f8' : '#3c4043', color: screen ? '#202124' : 'white', '&:hover': { bgcolor: screen ? '#aecbfa' : '#4f5256' }, p: 1.5 }}>
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Add Others / Invite">
                            <IconButton onClick={() => setShareDialogOpen(true)} sx={{ bgcolor: '#3c4043', color: 'white', '&:hover': { bgcolor: '#4f5256' }, p: 1.5 }}>
                                <PersonAddAlt1Icon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Chat">
                            <Badge badgeContent={newMessages} color="error">
                                <IconButton onClick={() => { setModal(!showModal); setNewMessages(0); }} sx={{ bgcolor: showModal ? '#8ab4f8' : '#3c4043', color: showModal ? '#202124' : 'white', '&:hover': { bgcolor: showModal ? '#aecbfa' : '#4f5256' }, p: 1.5 }}>
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </Tooltip>

                        <Tooltip title="Leave call">
                            <IconButton onClick={handleEndCall} sx={{ bgcolor: '#ea4335', color: 'white', '&:hover': { bgcolor: '#d93025' }, p: 1.5, px: 3, borderRadius: 8, ml: 2 }}>
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                </Box>
            )}


            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Invite people</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Share this link with others you want in the meeting.
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f3f4', p: 1, borderRadius: 2, mb: 3 }}>
                        <Typography variant="body2" sx={{ flex: 1, ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUrl}
                        </Typography>
                        <Tooltip title="Copy Link">
                            <IconButton onClick={handleCopy} color="primary">
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>Share via</Typography>
                    <List disablePadding>
                        <ListItem disablePadding>
                            <ListItemButton component="a" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`} target="_blank">
                                <ListItemIcon><WhatsAppIcon sx={{ color: '#25D366' }} /></ListItemIcon>
                                <ListItemText primary="WhatsApp" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank">
                                <ListItemIcon><FacebookIcon sx={{ color: '#1877F2' }} /></ListItemIcon>
                                <ListItemText primary="Facebook" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component="a" href={`mailto:?subject=Join Video Meeting&body=${encodeURIComponent(shareMessage)}`} target="_blank">
                                <ListItemIcon><EmailIcon sx={{ color: '#EA4335' }} /></ListItemIcon>
                                <ListItemText primary="Email" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </DialogContent>
            </Dialog>


            <Snackbar
                open={Boolean(snackbarMessage)}
                autoHideDuration={3000}
                onClose={() => setSnackbarMessage("")}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>

        </Box>
    );
}