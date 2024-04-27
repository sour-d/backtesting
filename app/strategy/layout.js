import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

export default function Layout({ children }) {
  return (
    <Grid container>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <Typography variant="h6">Trading System</Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          margin: { xs: "30px 20px", lg: "30px 10%" },
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Grid>
  );
}
