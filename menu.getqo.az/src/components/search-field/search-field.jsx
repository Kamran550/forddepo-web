import TextField from "@mui/material/TextField";

export const SearchField = (props) => (
  <TextField
    sx={(theme) => ({
      ".MuiInputBase-root": {
        borderRadius: "2rem",
        padding: "0.5rem 1rem",
        backgroundColor: theme.palette.grey[200],
        "&::before, &::after": {
          display: "none",
        },
      },
      ".MuiInputBase-input": {
        paddingTop: "0 !important",
        paddingBottom: "0 !important",
      },
    })}
    {...props}
  />
);
