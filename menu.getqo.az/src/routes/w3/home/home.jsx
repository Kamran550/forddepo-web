import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import classes from "./home.module.css";
import { W2Button } from "../../../components/w2-button";
import { useMutation } from "@tanstack/react-query";
import { callRequest } from "../../../services/call";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Menu from "../../../assets/icons/menu";
import Typography from "@mui/material/Typography";
import ArrowRight from "../../../assets/icons/arrow-right";
import WalletOutlined from "../../../assets/icons/wallet-outlined";
import Message from "../../../assets/icons/message";
import PhoneRing from "../../../assets/icons/phone-ring";

const W2Home = () => {
  const [search] = useSearchParams();
  const location = useLocation();
  const [successfullyCalled, setSuccessfullyCalled] = useState(false);
  const [callFailed, setCallFailed] = useState(false);
  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => {
      console.log(data);
      return callRequest(data);
    },
    onSuccess: () => setSuccessfullyCalled(true),
    onError: () => setCallFailed(true),
  });

  const handleClose = () => {
    setSuccessfullyCalled(false);
    setCallFailed(false);
  };

  const handleCallWaieter = () => {
    mutate({
      table_id: search.get("table_id"),
    });
  };
  return (
    <>
      {successfullyCalled && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={successfullyCalled}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Waiter called
          </Alert>
        </Snackbar>
      )}
      {callFailed && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={callFailed}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert severity="error" sx={{ width: "100%" }} onClose={handleClose}>
            Waiter call failed
          </Alert>
        </Snackbar>
      )}
      <Container maxWidth="sm">
        <div className={classes.container}>
          <h1 className={classes.title}>
            <span className={classes.highlight}>Best food</span>
            <br />
            for your
            <br /> taste
          </h1>
          <Stack width="100%" gap="10px">
            <Link to={{ pathname: "/w3/menu", search: location.search }}>
              <div className={`${classes.card} ${classes.yellow}`}>
                <div className={classes.iconWrapper}>
                  <Menu />
                </div>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography color="black" variant="subtitle1" fontSize={18}>
                    Menu
                  </Typography>
                  <button className={classes.arrow}>
                    <ArrowRight />
                  </button>
                </Stack>
              </div>
            </Link>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Link to={{ pathname: "/w3/payment", search: location.search }}>
                  <div className={`${classes.card} ${classes.blue}`}>
                    <div
                      className={`${classes.iconWrapper} ${classes.miniCardIcon}`}
                    >
                      <WalletOutlined />
                    </div>
                    <Stack mt={8}>
                      <button
                        style={{ transform: "rotate(90deg)" }}
                        className={`${classes.arrow}`}
                      >
                        <ArrowRight />
                      </button>
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontSize={18}
                      >
                        Payment
                      </Typography>
                    </Stack>
                  </div>
                </Link>
              </Grid>
              <Grid item xs={6}>
                <Link
                  to={{ pathname: "/w3/feedback", search: location.search }}
                >
                  <div className={`${classes.card} ${classes.green}`}>
                    <div
                      className={`${classes.iconWrapper} ${classes.miniCardIcon}`}
                    >
                      <Message />
                    </div>
                    <Stack mt={8}>
                      <button
                        style={{ transform: "rotate(45deg)" }}
                        className={`${classes.arrow}`}
                      >
                        <ArrowRight />
                      </button>
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontSize={18}
                      >
                        Feedback
                      </Typography>
                    </Stack>
                  </div>
                </Link>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Container>
      <div className={classes.buttonContainer}>
        <W2Button
          icon={<PhoneRing />}
          onClick={handleCallWaieter}
          loading={isLoading}
          variant="blackBtn"
        >
          Call the waiter
        </W2Button>
      </div>
    </>
  );
};

export default W2Home;
