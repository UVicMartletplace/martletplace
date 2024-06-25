export type MessageType = {
  text: string;
  sender_id: string;
};

// Uniquely identified by a listing id and two user ids
export type ThreadType = {
  listing_id: string;
  other_participant: {
    user_id: string;
    name: string;
    profilePicture: string;
  };
  last_message: {
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    content: string;
    sent_at: string;
  };
};
