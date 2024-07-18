import { useState, FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormHelperText,
} from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { colors } from "../styles/colors";
import { useStyles } from "../styles/pageStyles";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import _axios_instance from "../_axios_instance";

const CreateNewPassword = () => {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { user } = useUser();

  const [passwordError, setPasswordError] = useState("");

  const isFormIncomplete = !password || !confirmPassword;

  const navigate = useNavigate();

  const handleCreateNewPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[\W_]/.test(password)
    ) {
      setPasswordError("");
    } else {
      setPasswordError("Password does not meet the requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      if (!user) {
        alert("An error occurred. Please try again.");
        return;
      }
      await _axios_instance.patch("/api/user", {
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profileUrl,
        ignoreCharities: user.ignoreCharities,
        password: password,
      });

      navigate("/login");
    } catch (error) {
      alert("Failed to create new password. Please try again.");
    }
  };

  return (
    <Box sx={classes.loginAndCreateBox}>
      <Box sx={{ mb: 2 }}>
        <img
          src={martletPlaceLogo}
          alt="MartletPlace Logo"
          style={{ width: "100px" }}
        />
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Password
      </Typography>
      <Box
        component="form"
        onSubmit={handleCreateNewPassword}
        sx={classes.form}
      >
        <TextField
          label="Password"
          variant="outlined"
          required
          type="password"
          fullWidth
          margin="normal"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          required
          type="password"
          fullWidth
          id="confirm-password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!passwordError}
        />
        {passwordError && (
          <FormHelperText error>{passwordError}</FormHelperText>
        )}
        <Typography
          variant="body2"
          color={colors.martletplaceGrey}
          gutterBottom
          sx={{
            width: "100%",
            textAlign: "left",
            mt: 1,
            "& p": {
              margin: 0,
              padding: 0,
              lineHeight: "1.5",
            },
          }}
        >
          <p>Password must have at least:</p>
          <p>8 characters</p>
          <p>1 uppercase letter</p>
          <p>1 lowercase letter</p>
          <p>1 number</p>
          <p>1 special character</p>
        </Typography>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={classes.button}
          disabled={isFormIncomplete}
          id="reset-password-button"
        >
          Reset Password
        </Button>
      </Box>
    </Box>
  );
};

export default CreateNewPassword;
