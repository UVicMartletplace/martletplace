import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";
import { useStyles } from "../styles/pageStyles";
import { useEffect, useState } from "react";
import _axios_instance from "../_axios_instance";
import { useParams } from "react-router-dom";

interface ImageURLObject {
  url: string;
}

const Profile = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const isScreenSmall = useMediaQuery(theme.breakpoints.down("lg"));
  const { id } = useParams();

  const [, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>("");
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    bio: "",
    profile_picture: "",
  });
  const [originalProfile, setOriginalProfile] = useState(profile);
  const [editMode, setEditMode] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  // Load the user info
  useEffect(() => {
    _axios_instance
      .get("/user/" + id)
      .then((response) => {
        setProfile(response.data);
        setOriginalProfile(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  // This function makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data:image/");
    } catch (error) {
      return false;
    }
  };

  // Uploads a single image to the S3 server
  const asyncUploadSingleImage = async (
    imageBinary: string
  ): Promise<ImageURLObject | false> => {
    try {
      // Attempt to upload the image
      const response = await _axios_instance.post("/images", imageBinary, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Return the URL of the uploaded image on success
      return { url: response.data.url };
    } catch (error) {
      // Log error and return false on failure
      console.error("Error uploading image:", error);
      return false;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files && event.target?.files.length > 0) {
      const file = event.target?.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const base64String = event.target?.result as string;
          setImageURL(base64String); // Base64 string of the file contents

          if (!isImageValid(base64String)) {
            alert("Invalid image type. Please upload a valid image file.");
            return;
          }

          setImage(file);
          setImageURL(URL.createObjectURL(file));
          setEditMode(true);
        };

        reader.readAsDataURL(file); // This will trigger the onload function above
      }
    } else {
      alert("No image selected.");
    }

    setIsImageUploaded(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setProfile({ ...profile, [field]: e.target.value });
    setEditMode(true);
  };

  const handleSaveChanges = async () => {
    let successImages: boolean | ImageURLObject = false;
    if (isImageUploaded) {
      try {
        const listingImageBinary = imageURL.split(",")[1];
        successImages = await asyncUploadSingleImage(listingImageBinary);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    } else {
      successImages = { url: profile.profile_picture };
    }
    if (successImages) {
      profile.profile_picture = successImages.url;
      try {
        await _axios_instance.patch("/user", profile);
        setOriginalProfile(profile);
        console.log("Profile updated successfully");
      } catch (error) {
        console.error("Error saving changes:", error);
        alert("Error saving changes. Please try again.");
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
        height: "100vh",
      }}
    >
      {isDesktop && !isScreenSmall && (
        <AccountSidebar selectedItem="My Profile" />
      )}
      <Typography variant={"h2"}>My Profile</Typography>
      <Avatar
        src={imageURL}
        alt="Profile Picture"
        sx={{ width: 250, height: 250, mt: 2, mb: 2 }}
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
      <Box component="form" sx={{ width: "80%", maxWidth: "400px" }}>
        <TextField
          label="Username"
          variant="outlined"
          sx={{ mt: 2, width: "100%" }}
          margin="normal"
          value={profile.username}
          disabled
          onChange={(e) => handleInputChange(e, "username")}
          id="username"
        />
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
          label="Email"
          variant="outlined"
          sx={{ width: "100%" }}
          margin="normal"
          value={profile.email}
          disabled
          onChange={(e) => handleInputChange(e, "email")}
          id="email"
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
          id={"save_button"}
          disabled={!editMode}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="contained"
          sx={classes.cancelButton}
          onClick={handleCancelChanges}
          id={"cancel_button"}
          disabled={!editMode}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
