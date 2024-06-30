import CircularProgress from "@mui/material/CircularProgress";
import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  text: string;
}

export default function Spinner({ text }: Props) {
  const [isAlive, setIsAlive] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAlive(false);
    }, 40000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isAlive ? (
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
      ) : (
        <Grid
          gap={2}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ marginTop: "40px" }}
        >
          <Grid item>
            <CircularProgress
              variant="determinate"
              value={100}
              size="40px"
              sx={{ color: "red" }}
            />
          </Grid>
          <Grid item sx={{ textAlign: "center" }}>
            <Typography variant="h5">Network Error</Typography>
            <Typography variant="h6">
              Please try again some other time
            </Typography>
          </Grid>
        </Grid>
      )}
    </>
  );
}
