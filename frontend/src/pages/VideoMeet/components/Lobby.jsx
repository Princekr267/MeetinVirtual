import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export default function Lobby({
    username,
    usernameError,
    setUsername,
    setUsernameError,
    lobbyVideo,
    setLobbyVideo,
    lobbyVideoRef,
    lobbyAudio,
    setLobbyAudio,
    lobbyAudioRef,
    localVideoRef,
    connect,
    handleEndCall
}) {
    const textFieldSx = {
        '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            fontSize: '1rem',
            '& fieldset':           { borderColor: 'rgba(255, 255, 255, 0.15)' },
            '&:hover fieldset':     { borderColor: 'rgba(255, 255, 255, 0.35)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
        },
        '& .MuiInputLabel-root':            { color: 'var(--text-secondary)' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-primary)' },
    };

    const handleToggleVideo = () => {
        const newState = !lobbyVideo;
        setLobbyVideo(newState);
        lobbyVideoRef.current = newState;
        if (!newState) {
            window.localStream?.getVideoTracks().forEach(t => t.stop());
        } else {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    const track = stream.getVideoTracks()[0];
                    if (!track) return;
                    if (window.localStream) {
                        window.localStream.getVideoTracks().forEach(t => window.localStream.removeTrack(t));
                        window.localStream.addTrack(track);
                    } else {
                        window.localStream = stream;
                    }
                    if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;
                })
                .catch(console.error);
        }
    };

    const handleToggleAudio = () => {
        const newState = !lobbyAudio;
        setLobbyAudio(newState);
        lobbyAudioRef.current = newState;
        if (!newState) {
            window.localStream?.getAudioTracks().forEach(t => t.stop());
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const track = stream.getAudioTracks()[0];
                    if (!track) return;
                    if (window.localStream) {
                        window.localStream.getAudioTracks().forEach(t => window.localStream.removeTrack(t));
                        window.localStream.addTrack(track);
                    } else {
                        window.localStream = stream;
                    }
                })
                .catch(console.error);
        }
    };

    return (
        <div className="lobbyContainer">
            <div className="lobbyContent">
                {/* ── Video Preview Card ── */}
                <div className="lobbyPreviewCard">
                    {lobbyVideo ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className="lobbyPreview" />
                    ) : (
                        <div className="lobbyPreview lobbyVideoOff">
                            <div className="video-avatar-placeholder">
                                <div className="video-avatar-ring">
                                    <span className="video-avatar-initial">{(username || '?')[0].toUpperCase()}</span>
                                </div>
                                <p className="video-avatar-name">{username || 'You'}</p>
                                <span className="video-cam-off-label">
                                    <VideocamOffIcon sx={{ fontSize: '1rem' }} />
                                    Camera Off
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Quick Media Controls directly attached to preview */}
                    <div className="lobby-media-controls">
                        <IconButton
                            onClick={handleToggleVideo}
                            className={lobbyVideo ? 'activeIcon' : 'inactiveIcon'}
                            title={lobbyVideo ? 'Turn off camera' : 'Turn on camera'}
                            aria-label={lobbyVideo ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {lobbyVideo ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton
                            onClick={handleToggleAudio}
                            className={lobbyAudio ? 'activeIcon' : 'inactiveIcon'}
                            title={lobbyAudio ? 'Mute microphone' : 'Unmute microphone'}
                            aria-label={lobbyAudio ? 'Mute microphone' : 'Unmute microphone'}
                        >
                            {lobbyAudio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                    </div>
                </div>

                {/* ── Lobby Join Form Card ── */}
                <div className="lobbyForm">
                    <div className="lobbyTitleGroup">
                        <h2 className="lobbySubTitle">Enter into Lobby</h2>
                        <p className="lobbyDescription">Check your camera & audio before joining</p>
                    </div>

                    <TextField
                        id="lobby-name"
                        label="Your Name"
                        placeholder="Enter your display name"
                        value={username}
                        variant="outlined"
                        error={usernameError}
                        helperText={usernameError ? 'Name is required to join' : ''}
                        onChange={e => { setUsername(e.target.value); setUsernameError(false); }}
                        sx={textFieldSx}
                        autoComplete="name"
                    />

                    <div className="lobbyActionButtons">
                        <Button
                            variant="contained"
                            onClick={connect}
                            className="lobbyJoinButton"
                            sx={{
                                background: 'var(--accent-gradient)',
                                fontWeight: 600,
                                py: 1.4,
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 8px 20px rgba(0, 136, 255, 0.35)',
                            }}
                        >
                            Join Meeting
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<CallEndIcon />}
                            onClick={handleEndCall}
                            className="lobbyLeaveButton"
                            sx={{
                                background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                                color: '#fff',
                                fontWeight: 600,
                                py: 1.4,
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 15px rgba(255, 71, 87, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #ff6b81, #ff4757)',
                                    boxShadow: '0 6px 20px rgba(255, 71, 87, 0.55)',
                                },
                            }}
                        >
                            Leave
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
