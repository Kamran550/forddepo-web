import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import classes from "./delivery-type.module.css";
import { RadioInput } from "../radio-input";
const types = [
  {
    label: "Dine in",
    value: "dine_in",
  },

  {
    label: "Pick up",
    value: "pickup",
  },
];
export const DeliveryType = ({ deliveryType, onChange }) => {
  return (
    <>
      <Typography
        px={2}
        variant="subtitle1"
        fontSize={18}
        fontWeight={600}
        mb={1.5}
      >
        Delivery type
      </Typography>
      <FormControl sx={{ px: "1rem", width: "calc(100% - 2rem)", mb: 2 }}>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={deliveryType}
          onChange={(e) => onChange(e.target.value)}
          sx={{ gap: "10px" }}
        >
          {types.map((type) => (
            <div
              onClick={() => onChange(type.value)}
              className={classes.card}
              key={type.value}
            >
              <FormControlLabel
                value={type.value}
                control={<RadioInput />}
                label={type.label}
              />
            </div>
          ))}
        </RadioGroup>
      </FormControl>
    </>
  );
};
