import * as React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import AddReactionIcon from '@mui/icons-material/AddReaction'

const emojis = {
  happy: '😄',
  up: '👍',
  down: '👎',
  party: '🎉',
  heart: '❤️',
  eyes: '👀',
}

export default function EmojiReaction() {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  const submitEmoji = emoji => {
    console.log(emoji);
  }

  return (
    <div>
      <AddReactionIcon onClick={handleClick} />
      <Popper id={id} open={open} anchorEl={anchorEl} transition placement="bottom-end">
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box sx={{ border: '1px solid #757575', borderRadius: '5px', p: 1, bgcolor: '#fff', marginTop: '5px' }}>
              { Object.entries(emojis).map(([key, emoji]) =>
                <button
                  key={key}
                  style={{ margin: '0 5px' }}
                  onClick={() => submitEmoji(key)}
                >{emoji}</button>
              )}
            </Box>
          </Fade>
        )}
      </Popper>
    </div>
  );
}