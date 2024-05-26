"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";

export default function Home() {
  const router = useRouter();
  return (
    <Grid
      container
      sx={{
        height: "100vh",
      }}
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap="10px"
    >
      <Grid item>
        <Box p={2} textAlign="center">
          <Typography variant="h2" color="initial">
            Trading System
          </Typography>
        </Box>
      </Grid>
      <Grid item>
        <Button
          onClick={() => router.push("/live")}
          sx={{ margin: "0 auto" }}
          variant="contained"
        >
          Run A Strategy
        </Button>
      </Grid>
    </Grid>
  );
}
