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
import axios from "axios";

const CreateAccount = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFormEmpty = !email || !name || !username || !password;

  const navigate = useNavigate();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Regex for UVic email validation
    const emailFormat = /^[^@]+@uvic\.ca$/;

    // Regex for username validation
    const usernameFormat = /^[a-zA-Z]{1,20}$/;

    // Regex for password validation
    const passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

    if (!emailFormat.test(email)) {
      // Add or update an error state for email validation
      setEmailError("Email must be a valid UVic email address.");
      return;
    } else {
      // Clear email error if valid
      setEmailError("");
    }

    if (!usernameFormat.test(username)) {
      // Add or update an error state for username validation
      setUsernameError(
        "Username must be between 1 and 20 characters and only contain letters.",
      );
      return;
    } else {
      // Clear username error if valid
      setUsernameError("");
    }

    if (!passwordFormat.test(password)) {
      setPasswordError("Password does not meet the requirements.");
      return;
    } else {
      // Clear error message if password is valid
      setPasswordError("");
    }

    try {
      const response = await axios.post("/api/user", {
        username,
        name, // Assuming 'name' is required as same as 'username'
        email,
        password,
      });
      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      alert("Failed to create account. Please try again.");

      // Handle server errors here
    }

    // Temporary navigation to homepage until backend is ready: ticket #141
    navigate("/");
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
        University of Victoria
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Box component="form" onSubmit={handleCreateAccount} sx={classes.form}>
        <TextField
          label="Email, must be a valid UVic email"
          type="email"
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
          label="Full Name"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!emailError}
          name="fullName"
        />
        <TextField
          label="Username"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={!!usernameError}
          name="username"
        />
        {usernameError && (
          <FormHelperText error>{usernameError}</FormHelperText>
        )}
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
          disabled={isFormEmpty}
        >
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
