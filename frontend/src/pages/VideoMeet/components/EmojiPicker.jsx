import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const EMOJI_LIST = [
    '👍', '👎', '❤️', '😂', '😮',
    '😢', '😍', '🎉', '👏', '🔥',
    '💯', '✨', '🚀', '👋', '🙏',
    '💪', '🎊', '⭐', '💡', '🌟',
    '✅', '💖', '🥳', '😎', '🤔',
    '😱', '🤩', '😴', '🤗', '😇'
];

// Emojis that should not rotate (they change meaning when flipped)
const NO_ROTATE_EMOJIS = ['👍', '👎', '👈', '👉', '👆', '👇', '☝️', '✌️', '🤘', '🤙', '🖖', '✊', '👊', '🤛', '🤜', '👌', '🤏', '✍️'];

export default function EmojiPicker({ onEmojiSelect }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEmojiClick = (emoji) => {
        const shouldRotate = !NO_ROTATE_EMOJIS.includes(emoji);
        onEmojiSelect(emoji, shouldRotate);
    };

    // 5 cols × 44px + 4 gaps × 8px + 8px grid pad + 24px paper pad = 284px
    const PAPER_WIDTH = 284;

    return (
        <>
            <IconButton
                onClick={handleClick}
                className={open ? 'activeIcon' : 'inactiveIcon'}
                title="Send emoji reaction"
            >
                <EmojiEmotionsIcon />
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                marginThreshold={8}
                sx={{
                    // Push the entire popover up by 16px so it clears the control bar
                    '& .MuiPaper-root': {
                        marginTop: '-16px !important',
                    },
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: 'rgba(10, 15, 30, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '12px',
                            width: `${PAPER_WIDTH}px`,
                            maxHeight: '380px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(100,100,100,0.5)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: 'rgba(150,150,150,0.7)',
                            },
                        }
                    }
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 44px)',
                    gap: '8px',
                    padding: '4px',
                }}>
                    {EMOJI_LIST.map((emoji, index) => (
                        <button
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '8px',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '44px',
                                height: '44px',
                                transition: 'all 0.2s ease',
                            }}
                            onClick={() => handleEmojiClick(emoji)}
                            title={`Send ${emoji}`}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.target.style.transform = 'scale(1.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </Popover>
        </>
    );
}
