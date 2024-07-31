import { useCallback, useEffect, useState } from "react";
import { Typography, Grid, Box, Avatar, Paper } from "@mui/material";
import { colors } from "../styles/colors";
import { Charity } from "../pages/Charities";

interface CurrentCharityProps {
  charity: Charity;
}

const CurrentCharity = ({ charity }: CurrentCharityProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>(
    "Calculating time remaining...",
  );

  const calculateTimeRemaining = useCallback(() => {
    const endTime = new Date(charity.end_date).getTime();
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance < 0) {
      return "This charity event has ended.";
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }, [charity.end_date]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        margin: "20px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          color: colors.martletplaceNavyBlue,
          paddingBottom: "20px",
        }}
      >
        {charity.name}
      </Typography>
      <Typography
        variant="body1"
        sx={{ marginBottom: "20px", textAlign: "center" }}
      >
        {charity.description}
      </Typography>
      <img
        src={charity.image_url}
        alt={charity.name}
        style={{ maxWidth: "300px" }}
      />
      <Box
        component={Paper}
        elevation={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "20px",
          marginTop: "20px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Typography variant="h6">
          <strong>Total Funds Donated:</strong> ${charity.funds.toFixed(2)}
        </Typography>
        <Typography variant="h6">
          <strong>Charity Items Sold:</strong> {charity.listingsCount}
        </Typography>
        <Typography variant="h6" sx={{ marginTop: "20px" }}>
          <strong>Charity event ends in:</strong> {timeRemaining}
        </Typography>
        {charity.organizations && (
          <>
            <Typography variant="h6" sx={{ marginTop: "20px" }}>
              <strong>Receiving Organizations:</strong>
            </Typography>
            <Typography variant="body1">
              {charity.organizations
                .filter((org) => org.receiving)
                .map((org) => org.name)
                .join(", ")}
            </Typography>
            <Grid container spacing={1} sx={{ marginTop: "10px" }}>
              {charity.organizations
                .filter((org) => org.receiving)
                .map((org, index) => (
                  <Grid item key={index}>
                    <Avatar
                      src={org.logoUrl}
                      alt={org.name}
                      sx={{
                        width: "auto",
                        height: "auto",
                        maxHeight: "96px",
                        maxWidth: "96px",
                      }}
                    />
                  </Grid>
                ))}
            </Grid>
            <Typography variant="h6" sx={{ marginTop: "20px" }}>
              <strong>Partner Organizations:</strong>
            </Typography>
            <Typography variant="body1">
              {charity.organizations
                .filter((org) => !org.receiving)
                .map((org) => org.name)
                .join(", ")}
            </Typography>
            <Grid container spacing={1} sx={{ marginTop: "10px" }}>
              {charity.organizations
                .filter((org) => !org.receiving)
                .map((org, index) => (
                  <Grid item key={index}>
                    <Avatar
                      src={org.logoUrl}
                      alt={org.name}
                      sx={{
                        width: "auto",
                        height: "auto",
                        maxHeight: "96px",
                        maxWidth: "96px",
                      }}
                    />
                  </Grid>
                ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CurrentCharity;
