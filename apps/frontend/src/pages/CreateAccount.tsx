import { useState, FormEvent } from "react";
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
import Cookies from "js-cookie";
import useUser from "../hooks/useUser";
import axios from "axios";
// --- Uncomment these imports and delete getDefaultUser when backend auth is implemented ---
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
import { getDefaultUser } from "../MockUserUtils";

const CreateAccount = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFormIncomplete = !email || !name || !username || !password;

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();

    // Check if email is a valid UVic email
    if (!email.endsWith("@uvic.ca")) {
      setEmailError("Please enter a valid UVic email.");
      return;
    } else {
      setEmailError("");
    }

    // Regex for username validation
    const usernameFormat = /^[a-zA-Z0-9]{1,20}$/;

    if (!usernameFormat.test(username)) {
      setUsernameError(
        "Username must be between 1 and 20 characters and only contain letters or numbers.",
      );
      return;
    } else {
      setUsernameError("");
    }

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

    try {
      // --- Delete this when backend auth is implemented ---
      const mockUser = getDefaultUser();
      setUser(mockUser);

      const mockToken = btoa(JSON.stringify(mockUser));
      const mockJwtToken = `mockHeader.${mockToken}.mockSignature`;
      Cookies.set("token", mockJwtToken, { expires: 1, sameSite: "strict" });

      // right now this is here only to keep the test functionality
      await axios.post("/api/user", {
        name,
        username,
        email,
        password,
      });
      // --- Uncomment everything below when backend auth is implemented ---
      // const response = await axios.post("/api/user", {
      //  name,
      //   username,
      //   email,
      //   password,
      // });
      // const token = response.data.token;
      // Cookies.set("token", token, { sameSite: "strict", expires: 1 });
      // const decoded: User = jwtDecode(token);
      // setUser(decoded);

      navigate("/");
    } catch (error) {
      alert("Failed to create account. Please try again.");
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
        Signup
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
          label="Display Name"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          disabled={isFormIncomplete}
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
