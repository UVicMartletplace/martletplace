import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { colors } from "../styles/colors";
import { useNavigate } from "react-router-dom";

const Login = () => {
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

    navigate("/"); // Temporary navigation
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <img
          src={martletPlaceLogo}
          alt="MartletPlace Logo"
          style={{ width: "100px" }}
        />
      </Box>
      <Typography
        variant="h4"
        component="h1"
        color={colors.martletplaceBlack}
        gutterBottom
      >
        University of Victoria
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: colors.martletplaceNavyBlue,
            "&:hover": { backgroundColor: colors.martletplaceBlueHover },
            textTransform: "none",
            fontSize: "16px",
            padding: "10px 0",
            width: "40%",
          }}
        >
          Login
        </Button>
        <Link
          href="/user/resetpassword"
          underline="hover"
          sx={{
            mt: 2,
            color: colors.martletplaceBlack,
            "&:hover": { color: colors.martletplaceBlueHover },
          }}
        >
          Forgot Password?
        </Link>
        <Link
          href="/user/signup"
          underline="hover"
          sx={{
            mt: 1,
            color: colors.martletplaceBlack,
            "&:hover": { color: colors.martletplaceBlueHover },
          }}
        >
          New? Create an Account
        </Link>
      </Box>
    </Box>
  );
};

export default Login;
