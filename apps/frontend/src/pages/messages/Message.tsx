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
        message.sender_id == user.user?.id
          ? s.messageFromUser
          : s.messageFromOther
      }
    >
      {message.message_body}
    </Box>
  );
};
