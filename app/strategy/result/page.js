"use client";

import { CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { transformTradesData } from "./transformResult";
import Papa from "papaparse";
import ResultDashboard from "@/components/ResultDasbboard/ResultDashboard";

export default function Result() {
  const [result, setResult] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/strategy/result")
      .then((res) => res.json())
      .then(({ success, message, data }) => {
        if (!success) return;
        console.log(data);
        const { data: trades } = Papa.parse(data.trades, {
          header: true,
          dynamicTyping: true,
        });
        setResult({
          info: data.report,
          data: transformTradesData(trades, "1d"),
        });
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
        setIsLoaded(false);
      });
  }, []);

  return (
    <>
      {!isLoaded ? (
        <Grid container justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
      ) : (
        <ResultDashboard info={result.info} data={result.data} />
      )}
    </>
  );
}
