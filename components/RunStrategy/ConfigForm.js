import { camelCaseToStr } from "../utils";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";

const ConfigForm = ({ config, onChange, values }) => {
  return (
    <>
      {Object.keys(config).map((key) => {
        const type = typeof config[key] === "number" ? "number" : "text";
        return (
          <Grid item>
            <TextField
              fullWidth
              id={key}
              label={camelCaseToStr(key)}
              value={values[key]}
              type={type}
              onChange={({ target: { value } }) => onChange(key, value)}
            />
          </Grid>
        );
      })}
    </>
  );
};

export default ConfigForm;
