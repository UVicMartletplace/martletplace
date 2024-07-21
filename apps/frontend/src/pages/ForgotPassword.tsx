import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { useStyles } from "../styles/pageStyles";
import axios from "axios";

const ForgotPassword = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const isFormIncomplete = !email;

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!email.endsWith("@uvic.ca")) {
        setError("Please enter a valid UVic email.");
        return;
      } else {
        setError("");
      }

      await axios.post("/api/user/reset-password", {
        email,
      });

      alert("Please check your email for a password reset link.");
    } catch (error) {
      console.error(error);
      setError(
        "There was an error sending the password reset email. Please try again."
      );
    }
  };

  return (
    <Box sx={classes.loginAndCreateBox}>
      <img
        src={martletPlaceLogo}
        alt="MartletPlace Logo"
        style={{ width: "100px", marginBottom: "16px" }}
      />
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Send Password Reset Email
      </Typography>
      <Box component="form" onSubmit={handleResetPassword} sx={classes.form}>
        <TextField
          label="Email"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={email}
          id="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={classes.button}
          disabled={isFormIncomplete}
          id="reset-password-button"
        >
          Send Reset Email
        </Button>
        <Link href="/user/login" underline="hover" sx={classes.link}>
          Login
        </Link>
        <Link href="/user/signup" underline="hover" sx={classes.link}>
          New? Create an Account
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
