import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormHelperText,
  Link,
} from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { colors } from "../styles/colors";
import { useStyles } from "../styles/pageStyles";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

const CreateAccount = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Regex for password validation
    const passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

    // Regex for UVic email validation
    const emailFormat = /^[^@]+@uvic\.ca$/;

    if (!emailFormat.test(email)) {
      // Add or update an error state for email validation
      setEmailError("Email must be a valid UVic email address.");
      return;
    } else {
      // Clear email error if valid
      setEmailError("");
    }

    if (!passwordFormat.test(password)) {
      setPasswordError("Password does not meet the requirements.");
      return;
    } else {
      // Clear error message if password is valid
      setPasswordError("");
    }

    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Password:", password);

    //  Uncomment below code when backend is ready
    //  try {
    //   const response = await axios.post("/api/user", {
    //     username,
    //     name: username, // Assuming 'name' is required as same as 'username'
    //     email,
    //     password,
    //   });
    //   if (response.status === 201) {
    //     console.log("User created successfully", response.data);
    //     // Perform any actions after successful account creation, like redirecting to login page
    //   }
    // } catch (error) {
    //   console.error("Failed to create account", error.response.data);
    //   // Handle server errors here
    //   setPasswordError(
    //     error.response.data.error || "An unexpected error occurred"
    //   );
    // }

    // Temporary navigation
    navigate("/");
  };

  return (
    <Box sx={classes.loginAndCreateBox}>
      <Box sx={{ mb: 2 }}>
        <img
          src={martletPlaceLogo}
          alt="MartletPlace Logo"
          style={{ width: "100px", marginBottom: "16px" }}
        />
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        University of Victoria
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Box component="form" onSubmit={handleCreateAccount} sx={classes.form}>
        <TextField
          label="Email, must be a valid UVic email"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
        />
        {emailError && <FormHelperText error>{emailError}</FormHelperText>}

        <TextField
          label="Username"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          required
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          }}
        >
          Password must have at least:
          <br />
          8 characters
          <br />
          1 uppercase letter
          <br />
          1 lowercase letter
          <br />
          1 number
          <br />1 special character
        </Typography>
        <Button type="submit" variant="contained" fullWidth sx={classes.button}>
          Create Account
        </Button>
        <Typography
          variant="body2"
          color={colors.martletplaceGrey}
          gutterBottom
          sx={{ marginTop: "20px" }}
        >
          Your account can be customized further once you verify your account.
        </Typography>
        <Link href="/user/login" underline="hover" sx={classes.link}>
          Already have an account? Login
        </Link>
      </Box>
    </Box>
  );
};

export default CreateAccount;
