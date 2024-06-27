import { Avatar, Box, TextField, Typography } from "@mui/material";
import _axios_instance from "../_axios_instance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar";

interface profileObject {
  userID: string;
  username: string;
  name: string;
  bio: string;
  profileUrl: string;
}

const ViewProfile = () => {
  const [profile, setProfile] = useState<profileObject>({
    userID: "",
    username: "",
    name: "",
    bio: "",
    profileUrl: "",
  });

  const { id } = useParams<{ id: string }>();

  // Load the profile info for another user from the api given an ID
  useEffect(() => {
    console.log(`Fetching data for userID: ${id}`);
    _axios_instance
      .get("/user/" + id)
      .then((response) => {
        setProfile(response.data);
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
      });
  }, [id]);

  return (
    <>
      <SearchBar />
      <Box
        sx={{
          display: "flex",
          position: "relative",
          zIndex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ marginTop: 2 }}>
          User Profile
        </Typography>
        <Avatar
          src={profile.profileUrl}
          alt="Profile Picture"
          sx={{ width: 150, height: 150, mt: 2, mb: 2 }}
          id="profile_picture"
        />
        <Box sx={{ mt: 2, width: "80%", maxWidth: "400px", height: "50px" }}>
          <TextField
            label="Username"
            variant="outlined"
            sx={{ width: "100%" }}
            margin="normal"
            value={profile.username}
            id="username"
            disabled={true}
          />
          <TextField
            label="Name"
            variant="outlined"
            sx={{ width: "100%" }}
            margin="normal"
            value={profile.name}
            id="name"
            disabled={true}
          />
          <TextField
            label="Bio"
            variant="outlined"
            sx={{ width: "100%" }}
            margin="normal"
            multiline
            rows={4}
            value={profile.bio}
            id="bio"
            disabled={true}
          />
        </Box>
      </Box>
    </>
  );
};

export default ViewProfile;
