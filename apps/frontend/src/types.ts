export interface User {
  userID: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  profileUrl: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
export type MessageType = {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  message_body: string;
  created_at: string;
};

// Uniquely identified by a listing id and two user ids
export type ThreadType = {
  listing_id: string;
  other_participant: {
    user_id: string;
    name: string;
    profile_pic_url: string;
  };
  last_message: {
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    content: string;
    created_at: string;
  };
};

export type OrganizationObject = {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
};

export type CharityObject = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  organizations: OrganizationObject[];
};