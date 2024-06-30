import CircularProgress from "@mui/material/CircularProgress";
import { Grid, Typography } from "@mui/material";

interface Props {
  text: string;
}

export default function Spinner({ text }: Props) {
  return (
    <Grid
      gap={2}
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ marginTop: "40px" }}
    >
      <Grid item>
        <CircularProgress size="40px" />
      </Grid>
      <Grid item sx={{ textAlign: "center" }}>
        <Typography variant="h5">Hang with us</Typography>
        <Typography variant="h6">{text}</Typography>
      </Grid>
    </Grid>
  );
}
