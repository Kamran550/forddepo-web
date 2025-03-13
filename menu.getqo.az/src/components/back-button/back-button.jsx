import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "../../assets/icons/arrow-left";
import { Container, Typography } from "@mui/material";
import classes from "./back-button.module.css";

export const BackButton = ({ title, disabled }) => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Stack
        sx={{ my: 2, px: 1 }}
        direction="row"
        gap="1rem"
        alignItems="center"
      >
        <IconButton
          onClick={() => navigate(-1)}
          size="medium"
          className={classes.button}
          disabled={disabled}
        >
          <ArrowLeftIcon />
        </IconButton>
        <Typography variant="h6">{title || "Back"}</Typography>
      </Stack>
    </Container>
  );
};
