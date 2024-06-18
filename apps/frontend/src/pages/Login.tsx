import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import Cookies from "js-cookie";
import useUser from "../hooks/useUser";
import axios from "axios";
// --- Uncomment this import and remove getDefaultUser when backend auth is implemented ---
// import { jwtDecode } from "jwt-decode";
import { getDefaultUser } from "../MockUserUtils";

// interface User {
//   id: string;
//   username: string;
//   name: string;
// }

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const isFormIncomplete = !email || !password;
  const { setUser } = useUser();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // --- Delete this when backend auth is implemented ---
      const mockUser = getDefaultUser();
      setUser(mockUser);

      const mockToken = btoa(JSON.stringify(mockUser));
      const mockJwtToken = `mockHeader.${mockToken}.mockSignature`;
      Cookies.set("token", mockJwtToken, { expires: 1, sameSite: "strict" });

      // right now this is here just for the cypress tests
      await axios.post("/api/login", {
          email,
          password
        });
      // --- Uncomment everything below when backend auth is implemented ---
      // // TODO: Email and password format validation (for front end)
      // const response = await axios.post("/api/login", {
      //   email,
      //   password
      // });
      // const token = response.data.token;
      // Cookies.set("token", token, { sameSite: "strict", expires: 1 });
      // const decoded: User = jwtDecode<User>(token);
      // setUser(decoded);

      navigate("/");
    } catch (error) {
      // TODO: handle 401 error vs other errors differently
      setError("Login unsuccessful. Please try again later.");
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
