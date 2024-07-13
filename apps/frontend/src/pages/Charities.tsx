import { useState, useEffect, ChangeEvent } from "react";
import {
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Box,
  Avatar,
  Paper,
} from "@mui/material";
import CharityCard from "../components/CharityCard";
import SearchBar from "../components/searchBar";
import { colors } from "../styles/colors";
import _axios_instance from "../_axios_instance";
import Spinner from "../components/Spinner";

interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  organizations: Organization[];
  funds: number;
  listingsCount: number;
}

const Charities = () => {
  const currentDate = new Date();
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await _axios_instance.get("/charities");
        setCharities(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching charities:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCharity = Array.isArray(charities)
    ? charities.find((charity) => new Date(charity.endDate) >= currentDate)
    : undefined;

  const pastCharities = Array.isArray(charities)
    ? charities.filter((charity) => new Date(charity.endDate) < currentDate)
    : [];

  useEffect(() => {
    if (currentCharity) {
      const endTime = new Date(currentCharity.endDate).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(interval);
          setTimeRemaining("This charity event has ended.");
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentCharity]);

  const handleToggleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowPastEvents(event.target.checked);
  };

  if (loading) {
    return <Spinner text="Loading charities..." />;
  }

  return (
    <>
      <SearchBar />
      <FormControlLabel
        control={
          <Switch
            checked={showPastEvents}
            onChange={handleToggleChange}
            color="primary"
            id="charitiesSwitch"
          />
        }
        label={
          showPastEvents
            ? "Show Current Charity Event"
            : "Show Past Charity Events"
        }
        sx={{ marginLeft: "20px", marginTop: "20px" }}
      />
      {showPastEvents ? (
        pastCharities.length > 0 ? (
          <>
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{ paddingLeft: "20px", paddingTop: "20px" }}
            >
              Past Charity Events
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {pastCharities.map((charity, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <CharityCard {...charity} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography
            variant="h6"
            component="h4"
            gutterBottom
            sx={{ paddingLeft: "20px", paddingTop: "20px" }}
          >
            No Past Charities
          </Typography>
        )
      ) : (
        <>
          {currentCharity ? (
            <>
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
                  }}
                >
                  {currentCharity.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ marginBottom: "20px", textAlign: "center" }}
                >
                  {currentCharity.description}
                </Typography>
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
                    <strong>Total Funds Donated:</strong> $
                    {currentCharity.funds}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Charity Items Sold:</strong>{" "}
                    {currentCharity.listingsCount}
                  </Typography>
                  <Typography variant="h6" sx={{ marginTop: "20px" }}>
                    <strong>Charity event ends in:</strong> {timeRemaining}
                  </Typography>
                  <Typography variant="h6" sx={{ marginTop: "20px" }}>
                    <strong>Receiving Organizations:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {currentCharity.organizations
                      .filter((org) => org.receiving)
                      .map((org) => org.name)
                      .join(", ")}
                  </Typography>
                  <Grid container spacing={1} sx={{ marginTop: "10px" }}>
                    {currentCharity.organizations
                      .filter((org) => org.receiving)
                      .map((org, index) => (
                        <Grid item key={index}>
                          <Avatar src={org.logoUrl} alt={org.name} />
                        </Grid>
                      ))}
                  </Grid>
                  <Typography variant="h6" sx={{ marginTop: "20px" }}>
                    <strong>Partner Organizations:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {currentCharity.organizations
                      .filter((org) => !org.receiving)
                      .map((org) => org.name)
                      .join(", ")}
                  </Typography>
                  <Grid container spacing={1} sx={{ marginTop: "10px" }}>
                    {currentCharity.organizations
                      .filter((org) => !org.receiving)
                      .map((org, index) => (
                        <Grid item key={index}>
                          <Avatar src={org.logoUrl} alt={org.name} />
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              </Box>
            </>
          ) : (
            <Typography
              variant="h5"
              component="h3"
              sx={{
                paddingLeft: "20px",
                paddingTop: "20px",
                textAlign: "center",
              }}
            >
              No Current Charity Event
            </Typography>
          )}
        </>
      )}
    </>
  );
};

export default Charities;
