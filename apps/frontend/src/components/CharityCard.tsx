import { Card, CardContent, Typography, Grid, Avatar } from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import { colors } from "../styles/colors";

interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

interface CharityCardProps {
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
}

const CharityCard = ({
  name,
  description,
  startDate,
  endDate,
  organizations,
  funds,
  listingsCount,
}: CharityCardProps) => {
  const classes = useStyles();

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  const receivingOrganizations = organizations.filter((org) => org.receiving);
  const partnerOrganizations = organizations.filter((org) => !org.receiving);

  return (
    <Card
      sx={{ ...classes.charityCard, display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h5"
          component="h2"
          color={colors.martletplaceNavyBlue}
          sx={{ fontWeight: "bold" }}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {description}
        </Typography>
        <Typography variant="body1">
          <strong>Total Funds Donated:</strong> ${funds}
        </Typography>
        <Typography variant="body1">
          <strong>Charity Items Sold:</strong> {listingsCount}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Start Date:</strong> {formattedStartDate}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>End Date:</strong> {formattedEndDate}
        </Typography>
        <Typography sx={classes.sectionTitle}>
          Receiving Organizations:
        </Typography>
        <Typography variant="body1">
          {receivingOrganizations.map((org) => org.name).join(", ")}
        </Typography>
        <Grid container spacing={1} sx={{ marginTop: "10px" }}>
          {receivingOrganizations.map((org, index) => (
            <Grid item key={index}>
              <Avatar src={org.logoUrl} alt={org.name} sx={classes.orgLogo} />
            </Grid>
          ))}
        </Grid>
        <Typography sx={classes.sectionTitle} style={{ marginTop: "20px" }}>
          Partner Organizations:
        </Typography>
        <Typography variant="body1">
          {partnerOrganizations.map((org) => org.name).join(", ")}
        </Typography>
        <Grid container spacing={1} sx={{ marginTop: "10px" }}>
          {partnerOrganizations.map((org, index) => (
            <Grid item key={index}>
              <Avatar src={org.logoUrl} alt={org.name} sx={classes.orgLogo} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CharityCard;
