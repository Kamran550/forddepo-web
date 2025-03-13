import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

const Input = styled(TextField)({
  width: "100%",
  backgroundColor: "transparent",
  "& .MuiInputLabel-root": {
    fontSize: 12,
    lineHeight: "14px",
    fontWeight: 500,
    textTransform: "uppercase",
    color: "var(--color-black)",
    "&.Mui-error": {
      color: "var(--color-red)",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-black)",
  },
  "& .MuiInput-root": {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "19px",
    color: "var(--color-black)",
    fontFamily: "'Inter', sans-serif",
    "&.Mui-error::after": {
      borderBottomColor: "var(--color-red)",
    },
  },
  "& .MuiInput-root::before": {
    borderBottom: "1px solid var(--color-gray-stroke)",
  },
  "& .MuiInput-root:hover:not(.Mui-disabled)::before": {
    borderBottom: "2px solid var(--color-black)",
  },
  "& .MuiInput-root::after": {
    borderBottom: "2px solid var(--color-w2primary)",
  },
});

export const TextInput = (props) => {
  return (
    <Input variant="standard" InputLabelProps={{ shrink: true }} {...props} />
  );
};
