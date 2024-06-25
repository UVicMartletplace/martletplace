import {
  Avatar,
  Box,
  Button,
  FormHelperText,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";
import { useStyles } from "../styles/pageStyles";
import { ChangeEvent, useEffect, useState } from "react";
import _axios_instance from "../_axios_instance";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar";

interface ImageURLObject {
  url: string;
}

const Profile = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { id } = useParams();

  const [imageURL, setImageURL] = useState<string>("");
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "",
    bio: "",
    profilePictureUrl: "",
  });
  const [originalProfile, setOriginalProfile] = useState(profile);
  const [editMode, setEditMode] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const [usernameError, setUsernameError] = useState("");

  // Regex for username validation
  const usernameFormat = /^[a-zA-Z0-9]{1,20}$/;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await _axios_instance.get("/user/" + id);
        setProfile(response.data);
        setOriginalProfile(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id]);

  // Makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data:image/");
    } catch (error) {
      return false;
    }
  };

  // Uploads a single image to the S3 server
  const asyncUploadSingleImage = async (
    imageBinary: string,
  ): Promise<ImageURLObject | null> => {
    try {
      const response = await _axios_instance.post("/images", imageBinary, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { url: response.data.url };
    } catch (error) {
      return null;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files && event.target?.files.length > 0) {
      const file = event.target?.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const base64String = event.target?.result as string;
          setImageURL(base64String);

          if (!isImageValid(base64String)) {
            alert("Invalid image type. Please upload a valid image file.");
            return;
          }

          setImageURL(URL.createObjectURL(file));
          setEditMode(true);
        };

        reader.readAsDataURL(file);
      }
    } else {
      alert("No image selected.");
    }

    setIsImageUploaded(true);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    setProfile({ ...profile, [field]: e.target.value });
    setEditMode(true);
  };

  const handleSaveChanges = async () => {
    if (!usernameFormat.test(profile.username)) {
      // Add or update an error state for username validation
      setUsernameError(
        "Username must be between 1 and 20 characters and only contain letters or numbers.",
      );
      return;
    } else {
      // Clear username error if valid
      setUsernameError("");
    }

    let successImages: null | ImageURLObject = null;
    if (isImageUploaded) {
      try {
        const listingImageBinary = imageURL.split(",")[1];
        successImages = await asyncUploadSingleImage(listingImageBinary);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    } else {
      successImages = { url: profile.profilePictureUrl };
    }
    if (successImages) {
      profile.profilePictureUrl = successImages.url;
      try {
        await _axios_instance.patch("/user", profile);
        setOriginalProfile(profile);
      } catch (error) {
        alert(`Error: ${error}`);
      }
    } else {
      alert("Error uploading picture. Please try again.");
    }

    setEditMode(false);
    setIsImageUploaded(false);
  };

  const handleCancelChanges = () => {
    setProfile(originalProfile);
    setEditMode(false);
  };

  // TODO:
  // Uncomment once Scott's PR is merged: https://github.com/UVicMartletplace/martletplace/pull/183/files
  // Disable all text fields if !isCurrentUser
  // Hide Save, Cancel, and Upload Profile buttons if !isCurrentUser
  // Change "My Profile" to "<Name>'s Profile" if !isCurrentUser
  // Check if id is the current user's id:
  // const { user } = useUser();
  // const [isCurrentUser, setIsCurrentUser] = useState(false);
  // if (id === user.id) {
  //   setIsCurrentUser(true);
  // }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isDesktop && <AccountSidebar selectedItem="My Profile" />}
      {!isDesktop && <SearchBar />}
      <Typography variant={"h4"}>My Profile</Typography>
      <Avatar
        src={imageURL}
        alt="Profile Picture"
        sx={{ width: 150, height: 150, mt: 2, mb: 2 }}
        id="profile_picture"
      />
      <Button
        variant="contained"
        component="label"
        sx={classes.uploadPfp}
        id="upload_button"
      >
        Upload Picture
        <input type="file" hidden onChange={handleImageUpload} />
      </Button>
      <Box
        component="form"
        sx={{ mt: 2, width: "80%", maxWidth: "400px", height: "50px" }}
      >
        <TextField
          label="Username"
          variant="outlined"
          sx={{ width: "100%" }}
          margin="normal"
          value={profile.username}
          error={!!usernameError}
          onChange={(e) => handleInputChange(e, "username")}
          id="username"
        />
        {usernameError && (
          <FormHelperText error>{usernameError}</FormHelperText>
        )}
        <TextField
          label="Name"
          variant="outlined"
          sx={{ width: "100%" }}
          margin="normal"
          value={profile.name}
          onChange={(e) => handleInputChange(e, "name")}
          id="name"
        />
        <TextField
          label="Bio"
          variant="outlined"
          sx={{ width: "100%" }}
          margin="normal"
          multiline
          rows={4}
          value={profile.bio}
          onChange={(e) => handleInputChange(e, "bio")}
          id="bio"
        />
        <Button
          type="button"
          variant="contained"
          sx={classes.saveButton}
          onClick={handleSaveChanges}
          id="save_button"
          disabled={!editMode}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="contained"
          sx={classes.cancelButton}
          onClick={handleCancelChanges}
          id="cancel_button"
          disabled={!editMode}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
