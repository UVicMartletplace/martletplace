import { Box } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";
import { MessageType } from "../../types";
import useUser from "../../hooks/useUser";

export type MessageProps = {
  message: MessageType;
};
export const Message = ({ message }: MessageProps) => {
  const s = useStyles();
  const user = useUser();
  return (
<Box
      sx={
        message.sender_id == user.user?.userID
          ? s.messageFromUser
          : s.messageFromOther
      }
    >
      <Typography variant="body2">{message.message_body}</Typography>
    </Box>
  );
};
