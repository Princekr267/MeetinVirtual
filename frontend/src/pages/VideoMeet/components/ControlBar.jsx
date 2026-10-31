import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import BrushIcon from '@mui/icons-material/Brush';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiPicker from './EmojiPicker';

const QUICK_MOBILE_REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '🔥', '👏'];

export default function ControlBar({
    video,
    setVideo,
    audio,
    setAudio,
    screen,
    setScreen,
    screenAvailable,
    socketRef,
    handleEndCall,
    newMessages,
    handleChatToggle,
    showModal,
    connectedUsersLength,
    handleUsersToggle,
    showUsersPanel,
    handleWhiteboardToggle,
    showWhiteboard,
    onEmojiSelect
}) {
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const moreMenuOpen = Boolean(moreMenuAnchor);

    const handleMoreClick = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleVideoToggle = () => {
        setVideo(v => {
            const newState = !v;
            if (socketRef.current) {
                socketRef.current.emit('media-state-change', {
                    video: newState,
                    audio: audio
                });
            }
            return newState;
        });
    };

    const handleAudioToggle = () => {
        setAudio(a => {
            const newState = !a;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(track => {
                    track.enabled = newState;
                });
            }
            if (socketRef.current) {
                socketRef.current.emit('media-state-change', {
                    video: video,
                    audio: newState
                });
            }
            return newState;
        });
    };

    const handleScreenToggle = () => {
        setScreen(s => !s);
    };

    useEffect(() => {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('togglemicrophone', () => {
                    setAudio(a => {
                        const newState = !a;
                        if (window.localStream) {
                            window.localStream.getAudioTracks().forEach(track => {
                                track.enabled = newState;
                            });
                        }
                        if (socketRef.current) socketRef.current.emit('media-state-change', { video, audio: newState });
                        return newState;
                    });
                });
                navigator.mediaSession.setActionHandler('togglecamera', () => {
                    setVideo(v => {
                        const newState = !v;
                        if (socketRef.current) socketRef.current.emit('media-state-change', { video: newState, audio });
                        return newState;
                    });
                });
                navigator.mediaSession.setActionHandler('hangup', () => {
                    handleEndCall();
                });
                
                // Keep the microphone/camera states in sync visually in the PiP bar
                navigator.mediaSession.setMicrophoneActive(audio);
                navigator.mediaSession.setCameraActive(video);

                // Essential for some platforms to show controls
                navigator.mediaSession.metadata = new window.MediaMetadata({
                    title: 'Live Meeting',
                    artist: 'MeetinVirtual',
                    album: 'Room: ' + window.location.pathname.substring(1),
                    artwork: [
                        { src: '/vite.svg', sizes: '512x512', type: 'image/svg+xml' }
                    ]
                });
            } catch (error) {
                console.warn('MediaSession actions not supported:', error);
            }
        }
    }, [audio, video, socketRef, handleEndCall, setAudio, setVideo]);

    return (
        <div className="buttonContainers">
            {/* 1. Camera Toggle (Always visible) */}
            <IconButton
                onClick={handleVideoToggle}
                className={video ? 'activeIcon' : 'inactiveIcon'}
                title={video ? 'Turn off camera' : 'Turn on camera'}
                aria-label={video ? 'Turn off camera' : 'Turn on camera'}
            >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            {/* 2. End Call (Always visible, prominent) */}
            <IconButton
                onClick={handleEndCall}
                className="endCallIcon"
                title="End call"
                aria-label="End call"
            >
                <CallEndIcon />
            </IconButton>

            {/* 3. Mic Toggle (Always visible) */}
            <IconButton
                onClick={handleAudioToggle}
                className={audio ? 'activeIcon' : 'inactiveIcon'}
                title={audio ? 'Mute' : 'Unmute'}
                aria-label={audio ? 'Mute' : 'Unmute'}
            >
                {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {/* Desktop only: Screen Share */}
            <div className="desktopOnly">
                <IconButton
                    onClick={handleScreenToggle}
                    className={screen ? 'activeIcon' : 'inactiveIcon'}
                    title={screen ? 'Stop sharing' : 'Share screen'}
                    disabled={!screenAvailable}
                    aria-label="Screen Share"
                >
                    {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
            </div>

            {/* 4. Chat Toggle (Always visible) */}
            <Badge badgeContent={newMessages} max={99} color="error">
                <IconButton
                    onClick={handleChatToggle}
                    className={showModal ? 'activeIcon' : 'inactiveIcon'}
                    title="Chat"
                    aria-label="Chat"
                >
                    <ChatIcon />
                </IconButton>
            </Badge>

            {/* Desktop only: Participants */}
            <div className="desktopOnly">
                <Badge badgeContent={connectedUsersLength} color="primary">
                    <IconButton
                        onClick={handleUsersToggle}
                        className={showUsersPanel ? 'activeIcon' : 'inactiveIcon'}
                        title="Participants"
                        aria-label="Participants"
                    >
                        <PeopleIcon />
                    </IconButton>
                </Badge>
            </div>

            {/* Desktop only: Whiteboard */}
            <div className="desktopOnly">
                <IconButton
                    onClick={handleWhiteboardToggle}
                    className={showWhiteboard ? 'activeIcon' : 'inactiveIcon'}
                    title="Shared Whiteboard"
                    aria-label="Shared Whiteboard"
                >
                    <BrushIcon />
                </IconButton>
            </div>

            {/* Desktop only: Full Emoji Picker in Tray */}
            <div className="desktopOnly">
                <EmojiPicker onEmojiSelect={onEmojiSelect} />
            </div>

            {/* Mobile only: 3-Dots More Menu Button */}
            <IconButton
                onClick={handleMoreClick}
                className={`mobileOnly moreOptionsBtn ${moreMenuOpen ? 'moreOptionsBtn--open' : ''}`}
                title="More options"
                aria-label="More options"
            >
                <MoreVertIcon />
            </IconButton>

            {/* Opaque, Clean 3-Dots Menu for Mobile Screen */}
            <Menu
                anchorEl={moreMenuAnchor}
                open={moreMenuOpen}
                onClose={handleMoreClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#0f172a !important',
                        backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)) !important',
                        backdropFilter: 'blur(25px) !important',
                        WebkitBackdropFilter: 'blur(25px) !important',
                        color: '#f8fafc !important',
                        borderRadius: '20px !important',
                        border: '1px solid rgba(255, 255, 255, 0.15) !important',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.15) !important',
                        minWidth: '235px',
                        padding: '8px 6px',
                        marginBottom: '16px !important',
                        zIndex: 9999,
                        '& .MuiMenuItem-root': {
                            borderRadius: '12px',
                            padding: '10px 14px',
                            fontSize: '0.94rem',
                            fontWeight: 500,
                            color: '#f1f5f9',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(56, 189, 248, 0.16) !important',
                                color: '#38bdf8 !important',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.45,
                            }
                        }
                    }
                }}
            >
                {/* Quick Emoji Reactions Row inside 3-dots */}
                <div className="mobileMenuReactionsStrip">
                    {QUICK_MOBILE_REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            className="mobileMenuReactionBtn"
                            onClick={() => {
                                onEmojiSelect(emoji, emoji !== '👍');
                                handleMoreClose();
                            }}
                            title={`Send ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 0.8 }} />

                {/* Participants Item */}
                <MenuItem onClick={() => { handleUsersToggle(); handleMoreClose(); }}>
                    <ListItemIcon sx={{ color: showUsersPanel ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)' }}>
                        <Badge
                            badgeContent={connectedUsersLength}
                            color="primary"
                            sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: '16px', height: '16px' } }}
                        >
                            <PeopleIcon />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText>Participants ({connectedUsersLength})</ListItemText>
                </MenuItem>

                {/* Screen Share Item */}
                <MenuItem
                    onClick={() => { handleScreenToggle(); handleMoreClose(); }}
                    disabled={!screenAvailable}
                >
                    <ListItemIcon sx={{ color: screen ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)' }}>
                        {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                    </ListItemIcon>
                    <ListItemText>{screen ? 'Stop Sharing' : 'Share Screen'}</ListItemText>
                </MenuItem>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 0.8 }} />

                {/* Whiteboard Item */}
                <MenuItem onClick={() => { handleWhiteboardToggle(); handleMoreClose(); }}>
                    <ListItemIcon sx={{ color: showWhiteboard ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)' }}>
                        <BrushIcon />
                    </ListItemIcon>
                    <ListItemText>Shared Whiteboard</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
}
