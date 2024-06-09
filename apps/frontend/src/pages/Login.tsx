import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import axios from "axios";

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isFormIncomplete = !email || !password;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post("/api/login", {
        email,
        password,
      })
      .then(function (response) {
        console.log(response);
        navigate("/");
      })
      .catch(function (error) {
        console.error("Login failed:", error);
        setError(
          "Login unsuccessful. Invalid username and password combination",
        );
      });

    // Temporary navigation to homepage until backend is ready: ticket #140
    navigate("/");
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
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={classes.form}>
        <TextField
          label="Email"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={classes.button}
          disabled={isFormIncomplete}
        >
          Login
        </Button>
        <Link href="/user/resetpassword" underline="hover" sx={classes.link}>
          Forgot Password?
        </Link>
        <Link href="/user/signup" underline="hover" sx={classes.link}>
          New? Create an Account
        </Link>
      </Box>
    </Box>
  );
};

export default Login;
