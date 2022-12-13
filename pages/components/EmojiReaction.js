import React, { useState } from 'react'
import { useSWRConfig } from 'swr'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import Fade from '@mui/material/Fade'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import styles from './EmojiReaction.module.css'

const emojis = {
  happy: '😄',
  up: '👍',
  down: '👎',
  party: '🎉',
  heart: '❤️',
  eyes: '👀',
}

export default function EmojiReaction({ data, blogId, range }) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [usedEmojis, setUsedEmojis] = useState([]) // todo init based on localstorage
  const allEmojis = data.content.reactions || {}

  const { mutate } = useSWRConfig()

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  const submitEmoji = emoji => {
    setUsedEmojis((previousUsedEmojis) => [...previousUsedEmojis, emoji]);
    setOpen(false)

    const options = {
      method: 'POST',
      body: JSON.stringify({
        id: data.id,
        createdAt: data.createdAt,
        reaction: emoji,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    fetch(`/api/reactions/${blogId}`, options)
      .then(res => res.json())
      .then(() => mutate(`/api/items/${blogId}?range=${range}`))
      .catch(err => console.log('Unexpected error', err))
  }

  return (
    <div className={styles.container}>
      <div className={styles.emojiContainer}>
        { Object.entries(allEmojis).map(([key, value]) =>
          <Badge badgeContent={value} color="primary" key={key} max={99} className={styles.reaction}>
            { emojis[key] }
          </Badge>)
        }
      </div>
      <AddReactionIcon onClick={handleClick} className={styles.addIcon} />
      <Popper id={id} open={open} anchorEl={anchorEl} transition placement="bottom-end">
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box className={styles.popover}>
              { Object.entries(emojis).map(([key, emoji]) =>
                <Button
                  key={key}
                  className={styles.button}
                  onClick={() => submitEmoji(key)}
                >{emoji}</Button>
              )}
            </Box>
          </Fade>
        )}
      </Popper>
    </div>
  );
}