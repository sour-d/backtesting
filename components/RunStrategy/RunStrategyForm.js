"use client";

import React, { use, useEffect } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ConfigForm from "./ConfigForm";
import { camelCaseToStr } from "../utils";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Box, TextField } from "@mui/material";

const runStrategy = async (
  formData,
  stockName,
  timeFrame,
  onComplete,
  onError
) => {
  return fetch("/api/live/trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      strategyName: formData.strategy,
      stockName: stockName,
      timeFrame: timeFrame,
      config: formData,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        return onComplete(data);
      }
      onError(data);
    })
    .catch((err) => {
      onError(err);
    });
};

export default function StrategyChoiceForm() {
  const [strategiesConfig, setStrategies] = React.useState([]);
  const [formData, setFormData] = React.useState({});
  const [stockName, setStockName] = React.useState("GALAUSDT");
  const [timeFrame, setTimeFrame] = React.useState("1");
  const [message, setMessage] = React.useState({});

  useEffect(() => {
    setTimeout(() => setMessage({}), 10000);
  }, [message]);

  useEffect(() => {
    fetch("/api/strategy-list")
      .then((res) => res.json())
      .then((data) => {
        setStrategies(data);
      });
  }, []);

  const onComplete = (data) => setMessage({ type: "success", data });
  const onError = (data) => setMessage({ type: "error", data });
  console.log(formData);

  return (
    <>
      <Box sx={{ margin: "0 auto" }} width="50%">
        <Grid container flexDirection="column" gap="14px">
          <TextField
            id="stockName"
            label="Enter stock name"
            value={stockName}
            onChange={(e) => {
              setStockName(e.target.value.toUpperCase());
            }}
          />
          <TextField
            id="timeFrame"
            label="Enter time frame"
            value={timeFrame}
            onChange={(e) => {
              setTimeFrame(e.target.value);
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="selectStrategy">Select a strategy</InputLabel>
            <Select
              onChange={(e) =>
                setFormData({
                  strategy: e.target.value,
                  ...strategiesConfig[e.target.value],
                })
              }
              labelId="selectStrategy"
              label="Select a strategy"
            >
              {Object.keys(strategiesConfig).map((strategyName) => (
                <MenuItem value={strategyName}>
                  {camelCaseToStr(strategyName)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData?.strategy && (
            <ConfigForm
              config={strategiesConfig[formData.strategy]}
              values={formData}
              onChange={(key, val) =>
                setFormData((oldData) => ({ ...oldData, ...{ [key]: val } }))
              }
            />
          )}
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                runStrategy(formData, stockName, timeFrame, onComplete, onError)
              }
            >
              Run Strategy
            </Button>
          </Grid>
        </Grid>
        {message?.type && (
          <Snackbar
            open
            autoHideDuration={10000}
            TransitionComponent="SlideTransition"
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity={message.type === "success" ? "success" : "error"}
              variant="filled"
              sx={{
                width: "100%",
              }}
            >
              {message.data.message}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </>
  );
}
