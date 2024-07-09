import { ThreadType } from "../../types";
import { Box, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";

const user_id = "5"; // TODO: current user id

type ConversationsSidebarProps = {
  threads: ThreadType[];
  selectThread: (thread: ThreadType) => void;
  selectedThread: ThreadType | null;
};
export const ConversationsSidebar = ({
  threads,
  selectThread,
  selectedThread,
}: ConversationsSidebarProps) => {
  const s = useStyles();

  return (
<Box id="conversations_sidebar" sx={s.messagesConvSidebar}>
      <Stack direction="row">
        <Typography variant="h5">Conversations</Typography>
      </Stack>
      <Stack direction="column">
        {threads.map((thread) => {
          const isThreadSelected =
            selectedThread !== null &&
            selectedThread.listing_id === thread.listing_id &&
            selectedThread.other_participant.user_id ===
            thread.other_participant.user_id;
          return (
            <button
              key={
                "" +
                thread.listing_id +
                thread.other_participant.user_id +
                user_id
              }
              // TODO: add a 'selected' class, this is just to show how to apply the style conditionally
              style={{
                ...s.messagesConvBox,
                ...(isThreadSelected ? { backgroundColor: "white" } : {}),
              }}
              onClick={() => selectThread(thread)}
            >
              <div style={s.messagesConvPreviewText}>
                <Typography variant="body1">
                  {thread.last_message.content}
                </Typography>
              </div>
              <Box
                component="img"
                src={thread.other_participant.profile_pic_url}
                sx={s.messagesConvImg}
              />
            </button>
          );
        })}
      </Stack>
    </Box>
  );
};
