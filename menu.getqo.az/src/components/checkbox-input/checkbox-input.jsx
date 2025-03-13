import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";

const MuiCheckbox = styled(Checkbox)(() => ({
  padding: 0,
  color: "var(--dark-blue)",
  ".MuiSvgIcon-root": {
    fill: "var(--dark-blue)",
  },
}));

export const CheckboxInput = (props) => {
  return <MuiCheckbox disableRipple {...props} />;
};
