import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles"; // Adjust the path as necessary
// import axios from "axios";

const Login = () => {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);

    // Uncomment below code when backend is ready
    // try {
    //   const response = await axios.post('/api/login', { username, password });
    //   if (response.data.success) {
    //     navigate("/");
    //   }
    // } catch (error) {
    //   console.error('Login failed:', error);
    // }

    // Temporary navigation
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
        University of Victoria
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={classes.form}>
        <TextField
          label="Username/Email"
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
        />
        <Button type="submit" variant="contained" fullWidth sx={classes.button}>
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
