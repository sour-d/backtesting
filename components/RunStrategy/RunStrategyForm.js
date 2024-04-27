"use client";

import React, { useEffect } from "react";
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
import { Box } from "@mui/material";

const runStrategy = async (formData, onComplete, onError) => {
  return fetch("/api/strategy/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      strategyName: formData.strategy,
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

export default function StrategyChoiceForm({ config }) {
  const [strategies, setStrategies] = React.useState([]);
  const [formData, setFormData] = React.useState({});
  const [message, setMessage] = React.useState({});

  useEffect(() => {
    setTimeout(() => setMessage({}), 10000);
  }, [message]);

  useEffect(() => {
    fetch("/api/strategy/list")
      .then((res) => res.json())
      .then((data) => {
        setStrategies(data);
      });
  }, []);

  const onComplete = (data) => setMessage({ type: "success", data });
  const onError = (data) => setMessage({ type: "error", data });

  return (
    <>
      <Box sx={{ margin: "0 auto" }} width="50%">
        <Grid container flexDirection="column" gap="14px">
          <FormControl fullWidth>
            <InputLabel id="selectStrategy">Select a strategy</InputLabel>
            <Select
              onChange={(e) =>
                setFormData({
                  strategy: e.target.value,
                  ...strategies[e.target.value],
                })
              }
              labelId="selectStrategy"
              label="Select a strategy"
            >
              {Object.keys(strategies).map((strategyName) => (
                <MenuItem value={strategyName}>
                  {camelCaseToStr(strategyName)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData?.strategy && (
            <ConfigForm
              config={strategies[formData.strategy]}
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
              onClick={() => runStrategy(formData, onComplete, onError)}
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
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
