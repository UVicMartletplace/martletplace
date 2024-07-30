import { useState, useEffect, ChangeEvent } from "react";
import { Typography, Grid, Switch, FormControlLabel, Box } from "@mui/material";
import CharityCard from "../components/CharityCard";
import SearchBar from "../components/searchBar";
import _axios_instance from "../_axios_instance";
import Spinner from "../components/Spinner";
import CurrentCharity from "../components/CurrentCharity";

export interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

export interface Charity {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  organizations?: Organization[];
  funds: number;
  listingscount: number;
}

const Charities = () => {
  const currentDate = new Date();
  const [showPastEvents, setShowPastEvents] = useState(false);
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
    ? charities.find((charity) => new Date(charity.end_date) >= currentDate)
    : null;

  const pastCharities = Array.isArray(charities)
    ? charities.filter((charity) => new Date(charity.end_date) < currentDate)
    : [];

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
        <Box>
          <Typography
            variant="h5"
            component="h3"
            gutterBottom
            sx={{ paddingLeft: "20px", paddingTop: "20px" }}
          >
            Current Charity Events
          </Typography>
          {currentCharity && <CurrentCharity charity={currentCharity} />}
        </Box>
      )}
    </>
  );
};

export default Charities;
