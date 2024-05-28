"use client";

import { CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { transformTradesData } from "../../../trading/outcome/transformResult";
import ResultDashboard from "@/components/ResultDasbboard/ResultDashboard";
import showInfo from "./showInfo";

export default function Result() {
  const [result, setResult] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const filename = new URLSearchParams(window.location.search).get(
      "filename"
    );
    fetch("/api/live/result?filename=" + filename)
      .then((res) => res.json())
      .then(({ success, message, data }) => {
        if (!success) return;
        console.log(data);
        const { trades, report } = data;
        const parsedTrades = transformTradesData(trades, "1", report.capital);
        console.log({ parsedTrades });
        console.log(showInfo(parsedTrades));
        // const { data: trad
        // setResult({
        //   info: data.report,
        //   data: transformTradesData(trades, "1d"),
        // });
        // setIsLoaded(true);
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
