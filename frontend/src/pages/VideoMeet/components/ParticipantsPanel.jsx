import React from 'react';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import StarIcon from '@mui/icons-material/Star';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

export default function ParticipantsPanel({
    showUsersPanel,
    connectedUsers,
    isHost,
    isRoomLocked,
    handleToggleRoomLock,
    participantMediaState,
    socketIdRef,
    hostSocketId,
    video,
    audio,
    screen,
    screenSharingSocketId,
    handleMuteUser,
    handleVideoOffUser,
    setShowTransferConfirm,
    setShowKickConfirm,
    handleUsersToggle,
    handlePinUser,
    pinnedSocketId
}) {
    if (!showUsersPanel) return null;

    return (
        <div className="usersPanel">
            <div className="chatHeader">
                <h1>Participants ({connectedUsers.length})</h1>
                <div>
                    {isHost && (
                        <IconButton
                            onClick={handleToggleRoomLock}
                            title={isRoomLocked ? "Unlock room" : "Lock room"}
                            size="small"
                            sx={{
                                color: isRoomLocked ? '#ff4757' : 'rgba(255, 255, 255, 0.6)',
                                '&:hover': { color: '#fff' },
                                mr: 1
                            }}
                        >
                            {isRoomLocked ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                    )}
                    <IconButton
                        onClick={handleUsersToggle}
                        title="Close participants"
                        size="small"
                        sx={{ color: 'var(--text-secondary)', '&:hover': { color: '#ff4757' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>

            {isRoomLocked && (
                <div className="room-locked-banner">
                    <LockIcon sx={{ fontSize: '1rem' }} />
                    <span>Room is locked - No new participants can join</span>
                </div>
            )}

            <div className="usersList">
                {/* ── Active Screen Share / Presentation Item ── */}
                {((screen && socketIdRef.current) || (screenSharingSocketId && screenSharingSocketId !== socketIdRef.current)) && (() => {
                    const isSelfSharing = screen;
                    const presenterSocketId = isSelfSharing ? socketIdRef.current : screenSharingSocketId;
                    const presenterUser = connectedUsers.find(u => u.socketId === presenterSocketId);
                    const presenterName = isSelfSharing ? "You" : (presenterUser?.name || "Participant");
                    const screenTileId = isSelfSharing ? "local-screen" : `${presenterSocketId}-screen`;
                    const isScreenPinned = pinnedSocketId === screenTileId;

                    return (
                        <div className="userItem screenShareItem" style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '12px',
                            marginBottom: '10px'
                        }}>
                            <div className="userAvatar" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', fontSize: '1.2rem' }}>
                                🖥️
                            </div>
                            <div className="userInfo">
                                <span className="userName" style={{ color: '#e0f2fe', fontWeight: 600 }}>
                                    {presenterName}'s Screen
                                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginLeft: '6px' }}>(Presentation)</span>
                                </span>
                                <div className="user-media-status">
                                    <span className="userStatus" style={{ color: '#38bdf8' }}>● Screen sharing</span>
                                </div>
                            </div>
                            <IconButton
                                size="small"
                                onClick={() => handlePinUser(screenTileId)}
                                title={isScreenPinned ? "Unpin screen" : "Pin screen"}
                                sx={{
                                    color: isScreenPinned ? '#4ade80' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { color: '#4ade80' },
                                    mr: 1
                                }}
                            >
                                {isScreenPinned ? <PushPinIcon sx={{ fontSize: '1rem' }} /> : <PushPinOutlinedIcon sx={{ fontSize: '1rem' }} />}
                            </IconButton>
                        </div>
                    );
                })()}

                {connectedUsers.map((user) => {
                    const userMediaState = participantMediaState[user.socketId];
                    const isCurrentUser = user.socketId === socketIdRef.current;
                    const isUserHost = user.socketId === hostSocketId;
                    const isPinned = user.socketId === pinnedSocketId;
                    const videoOn = isCurrentUser ? video : (userMediaState?.video === true);
                    const audioOn = isCurrentUser ? audio : (userMediaState?.audio === true);

                    return (
                        <div className="userItem" key={user.socketId}>
                            <div className="userAvatar">
                                {(user.name || 'U')[0].toUpperCase()}
                                {isUserHost && (
                                    <span className="hostBadge" title="Host">
                                        <StarIcon sx={{ fontSize: '0.9rem' }} />
                                    </span>
                                )}
                            </div>
                            <div className="userInfo">
                                <span className="userName">
                                    {user.name || 'Unknown'}
                                    {isCurrentUser && (
                                        <span className="youBadge"> (You)</span>
                                    )}
                                    {isUserHost && !isCurrentUser && (
                                        <span className="hostLabel"> (Host)</span>
                                    )}
                                    {isPinned && (
                                        <span style={{ marginLeft: '8px', color: '#4ade80' }}>📌</span>
                                    )}
                                    {((isCurrentUser && screen) || (!isCurrentUser && screenSharingSocketId === user.socketId)) && (
                                        <span style={{
                                            marginLeft: '6px',
                                            color: '#38bdf8',
                                            fontSize: '0.75rem',
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(56, 189, 248, 0.3)'
                                        }}>
                                            🖥️ Sharing
                                        </span>
                                    )}
                                </span>
                                <div className="user-media-status">
                                    {!audioOn && (
                                        <span className="status-icon muted" title="Muted">
                                            <MicOffIcon sx={{ fontSize: '0.9rem' }} />
                                        </span>
                                    )}
                                    {!videoOn && (
                                        <span className="status-icon video-off" title="Camera off">
                                            <VideocamOffIcon sx={{ fontSize: '0.9rem' }} />
                                        </span>
                                    )}
                                    {audioOn && videoOn && (
                                        <span className="userStatus">● In call</span>
                                    )}
                                </div>
                            </div>

                            {/* Pin Button - available to everyone for non-self users */}
                            {!isCurrentUser && (
                                <IconButton
                                    size="small"
                                    onClick={() => handlePinUser(user.socketId)}
                                    title={isPinned ? "Unpin participant" : "Pin participant"}
                                    sx={{
                                        color: isPinned ? '#4ade80' : 'rgba(255, 255, 255, 0.6)',
                                        '&:hover': { color: isPinned ? '#22c55e' : '#4ade80' },
                                        mr: 1
                                    }}
                                >
                                    {isPinned ? <PushPinIcon sx={{ fontSize: '1rem' }} /> : <PushPinOutlinedIcon sx={{ fontSize: '1rem' }} />}
                                </IconButton>
                            )}

                            {/* Host Controls */}
                            {isHost && !isCurrentUser && (
                                <div className="hostControls">
                                    {/* Only show mute button if user's audio is ON */}
                                    {audioOn && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleMuteUser(user.socketId)}
                                            title="Mute participant"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                '&:hover': { color: '#ff4757' }
                                            }}
                                        >
                                            <MicOffIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    )}

                                    {/* Only show video-off button if user's video is ON */}
                                    {videoOn && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleVideoOffUser(user.socketId)}
                                            title="Turn off camera"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                '&:hover': { color: '#ff4757' }
                                            }}
                                        >
                                            <VideocamOffIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    )}

                                    <IconButton
                                        size="small"
                                        onClick={() => setShowTransferConfirm(user.socketId)}
                                        title="Make host"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            '&:hover': { color: '#ffd700' }
                                        }}
                                    >
                                        <StarIcon sx={{ fontSize: '1rem' }} />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        onClick={() => setShowKickConfirm(user.socketId)}
                                        title="Remove participant"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            '&:hover': { color: '#ff4757' }
                                        }}
                                    >
                                        <PersonRemoveIcon sx={{ fontSize: '1rem' }} />
                                    </IconButton>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
