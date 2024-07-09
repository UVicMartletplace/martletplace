import { Box, Button, Input, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";
import { useState } from "react";

// Made this into a component because if it was all inline, every time the user
// types a message, the entire Messages component (page) would re-render
type MessageSendBoxProps = {
  onMessageSend: (text: string) => void;
};
export const MessageSendBox = ({ onMessageSend }: MessageSendBoxProps) => {
  const s = useStyles();
  const [text, setText] = useState<string>("");

  const onType = (e: React.ChangeEvent) => {
    // @ts-expect-error - doesn't matter
    setText(e.currentTarget.value);
  };

  const onClickSend = () => {
    if (text === "") {
      return;
    }
    onMessageSend(text);
    setText("");
  };

  return (
<Box sx={s.messagesSendBox}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Input
            onChange={onType}
            placeholder="Type Here"
            value={text}
            sx={{
              flex: "4",
              borderColor: "black",
              border: "10px",
              borderRadius: "10px",
            }}
          />
          <Button
            type="submit"
            onClick={onClickSend}
            sx={{ ...s.button, flex: "1", color:"white", marginLeft: "10px" }}
          >
            Send
          </Button>
        </Box>
      </form>
    </Box>
  );
};
