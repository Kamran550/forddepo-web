import { createTheme } from "@mui/material";
import { green } from "@mui/material/colors";

const defaultTheme = createTheme();

const theme = createTheme({
  shape: {
    borderRadius: 20,
  },
  shadows: defaultTheme.shadows,
  palette: {
    primary: {
      main: green[500],
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
        contained: {
          color: "var(--color-white)",
        },
      },
    },
  },
});

export default theme;
