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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const CharityCard = ({
  name,
  description,
  start_date,
  end_date,
  organizations = [],
  funds,
  listingscount,
}: CharityCardProps) => {
  const classes = useStyles();

  const formattedStartDate = formatDate(start_date);
  const formattedEndDate = formatDate(end_date);

  const receivingOrganizations =
    organizations?.filter((org) => org.receiving) || [];
  const partnerOrganizations =
    organizations?.filter((org) => !org.receiving) || [];

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
          <strong>Charity Items Sold:</strong> {listingscount}
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
          {receivingOrganizations.length > 0
            ? receivingOrganizations.map((org) => org.name).join(", ")
            : "N/A"}
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
          {partnerOrganizations.length > 0
            ? partnerOrganizations.map((org) => org.name).join(", ")
            : "N/A"}
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
