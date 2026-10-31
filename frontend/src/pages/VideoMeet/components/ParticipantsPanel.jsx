import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import StarIcon from '@mui/icons-material/Star';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function ParticipantsPanel({
    showUsersPanel,
    connectedUsers = [],
    isHost,
    isRoomLocked,
    handleToggleRoomLock,
    participantMediaState = {},
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
    const [searchQuery, setSearchQuery] = useState('');

    if (!showUsersPanel) return null;

    const filteredUsers = connectedUsers.filter(u =>
        (u.name || 'User').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const isSelfSharing = screen;
    const hasScreenShare = (screen && socketIdRef.current) || (screenSharingSocketId && screenSharingSocketId !== socketIdRef.current);
    const presenterSocketId = isSelfSharing ? socketIdRef.current : screenSharingSocketId;
    const presenterUser = connectedUsers.find(u => u.socketId === presenterSocketId);
    const presenterName = isSelfSharing ? "You" : (presenterUser?.name || "Participant");
    const screenTileId = isSelfSharing ? "local-screen" : `${presenterSocketId}-screen`;
    const isScreenPinned = pinnedSocketId === screenTileId;

    return (
        <div className="usersPanel">
            {/* Header */}
            <div className="chatHeader">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h1>Participants</h1>
                    <span className="participantCountPill">{connectedUsers.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isHost && (
                        <Tooltip title={isRoomLocked ? "Unlock room" : "Lock room"} arrow>
                            <IconButton
                                onClick={handleToggleRoomLock}
                                size="small"
                                sx={{
                                    color: isRoomLocked ? '#ff4757' : 'rgba(255, 255, 255, 0.65)',
                                    '&:hover': { color: isRoomLocked ? '#ff6b81' : '#fff' },
                                    mr: 0.5
                                }}
                            >
                                {isRoomLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Close" arrow>
                        <IconButton
                            onClick={handleUsersToggle}
                            size="small"
                            sx={{ color: 'rgba(255, 255, 255, 0.65)', '&:hover': { color: '#ff4757' } }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Room Locked Warning */}
            {isRoomLocked && (
                <div className="room-locked-banner">
                    <LockIcon sx={{ fontSize: '0.95rem' }} />
                    <span>Room is locked — No new participants can join</span>
                </div>
            )}

            {/* Search Box */}
            <div className="participantsSearchBox">
                <SearchIcon sx={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.45)', flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="participantsSearchInput"
                />
                {searchQuery && (
                    <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: 'rgba(255, 255, 255, 0.5)', p: '2px', '&:hover': { color: '#fff' } }}
                    >
                        <ClearIcon sx={{ fontSize: '0.95rem' }} />
                    </IconButton>
                )}
            </div>

            {/* Scrollable Container */}
            <div className="usersList">
                {/* ── Active Presentation Item ── */}
                {hasScreenShare && (
                    <>
                        <div className="participantsSectionHeader">
                            <span>PRESENTATION</span>
                        </div>
                        <div className="userItem screenShareItem">
                            <div className="userAvatar screenShareAvatar">
                                🖥️
                            </div>
                            <div className="userInfo">
                                <span className="userName" title={`${presenterName}'s Screen`}>
                                    <span className="userNameText">{presenterName}'s Screen</span>
                                    <span className="screenBadge">Screen</span>
                                </span>
                                <div className="user-media-status">
                                    <span className="userStatus" style={{ color: '#38bdf8' }}>● Presenting</span>
                                </div>
                            </div>
                            <Tooltip title={isScreenPinned ? "Unpin presentation" : "Pin presentation to full screen"} arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => handlePinUser(screenTileId)}
                                    sx={{
                                        color: isScreenPinned ? '#4ade80' : 'rgba(255, 255, 255, 0.6)',
                                        background: isScreenPinned ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                        '&:hover': {
                                            color: isScreenPinned ? '#22c55e' : '#4ade80',
                                            background: 'rgba(74, 222, 128, 0.2)'
                                        },
                                        flexShrink: 0
                                    }}
                                >
                                    {isScreenPinned ? <PushPinIcon sx={{ fontSize: '1rem' }} /> : <PushPinOutlinedIcon sx={{ fontSize: '1rem' }} />}
                                </IconButton>
                            </Tooltip>
                        </div>
                    </>
                )}

                {/* ── Participants List ── */}
                <div className="participantsSectionHeader">
                    <span>IN MEETING ({filteredUsers.length})</span>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="participantsEmptySearch">
                        <span>No participants match "{searchQuery}"</span>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const userMediaState = participantMediaState[user.socketId];
                        const isCurrentUser = user.socketId === socketIdRef.current;
                        const isUserHost = user.socketId === hostSocketId;
                        const isPinned = user.socketId === pinnedSocketId;
                        const videoOn = isCurrentUser ? video : (userMediaState?.video === true);
                        const audioOn = isCurrentUser ? audio : (userMediaState?.audio === true);
                        const isUserSharingScreen = (isCurrentUser && screen) || (!isCurrentUser && screenSharingSocketId === user.socketId);

                        return (
                            <div className="userItem" key={user.socketId}>
                                <div className="userAvatar">
                                    {(user.name || 'U')[0].toUpperCase()}
                                    {isUserHost && (
                                        <span className="hostBadge" title="Host">
                                            <StarIcon sx={{ fontSize: '0.8rem' }} />
                                        </span>
                                    )}
                                </div>
                                <div className="userInfo">
                                    <span className="userName" title={user.name || 'Unknown'}>
                                        <span className="userNameText">{user.name || 'Unknown'}</span>
                                        {isCurrentUser && <span className="youBadge">(You)</span>}
                                        {isUserHost && !isCurrentUser && <span className="hostLabel">(Host)</span>}
                                        {isUserSharingScreen && <span className="screenBadge">🖥️ Sharing</span>}
                                        {isPinned && <span className="pinnedBadge">📌</span>}
                                    </span>
                                    <div className="user-media-status">
                                        {!audioOn && (
                                            <span className="status-icon muted" title="Microphone off">
                                                <MicOffIcon sx={{ fontSize: '0.85rem' }} />
                                            </span>
                                        )}
                                        {!videoOn && (
                                            <span className="status-icon video-off" title="Camera off">
                                                <VideocamOffIcon sx={{ fontSize: '0.85rem' }} />
                                            </span>
                                        )}
                                        {audioOn && videoOn && (
                                            <span className="userStatus">● In call</span>
                                        )}
                                    </div>
                                </div>

                                <div className="userActions">
                                    {/* Pin Button */}
                                    <Tooltip title={isPinned ? "Unpin participant" : "Pin participant to full screen"} arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => handlePinUser(user.socketId)}
                                            sx={{
                                                color: isPinned ? '#4ade80' : 'rgba(255, 255, 255, 0.55)',
                                                background: isPinned ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                                                '&:hover': {
                                                    color: isPinned ? '#22c55e' : '#4ade80',
                                                    background: 'rgba(74, 222, 128, 0.2)'
                                                }
                                            }}
                                        >
                                            {isPinned ? <PushPinIcon sx={{ fontSize: '0.95rem' }} /> : <PushPinOutlinedIcon sx={{ fontSize: '0.95rem' }} />}
                                        </IconButton>
                                    </Tooltip>

                                    {/* Host Controls */}
                                    {isHost && !isCurrentUser && (
                                        <div className="hostControls">
                                            {audioOn && (
                                                <Tooltip title="Mute microphone" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMuteUser(user.socketId)}
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.55)',
                                                            '&:hover': { color: '#ff4757', background: 'rgba(255, 71, 87, 0.15)' }
                                                        }}
                                                    >
                                                        <MicOffIcon sx={{ fontSize: '0.95rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {videoOn && (
                                                <Tooltip title="Turn off camera" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleVideoOffUser(user.socketId)}
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.55)',
                                                            '&:hover': { color: '#ff4757', background: 'rgba(255, 71, 87, 0.15)' }
                                                        }}
                                                    >
                                                        <VideocamOffIcon sx={{ fontSize: '0.95rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Tooltip title="Make host" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setShowTransferConfirm(user.socketId)}
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.55)',
                                                        '&:hover': { color: '#ffd700', background: 'rgba(255, 215, 0, 0.15)' }
                                                    }}
                                                >
                                                    <StarIcon sx={{ fontSize: '0.95rem' }} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Remove participant" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setShowKickConfirm(user.socketId)}
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.55)',
                                                        '&:hover': { color: '#ff4757', background: 'rgba(255, 71, 87, 0.15)' }
                                                    }}
                                                >
                                                    <PersonRemoveIcon sx={{ fontSize: '0.95rem' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
