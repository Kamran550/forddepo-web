import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { W2HomeCard } from "../../../components/home-card";
import classes from "./home.module.css";
import { W2Button } from "../../../components/w2-button";
import { useMutation } from "@tanstack/react-query";
import { callRequest } from "../../../services/call";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const links = [
  {
    title: "Menu",
    path: "/menu",
    image: "/food2.png",
  },
  {
    title: "Feedback",
    path: "/feedback",
    image: "/feedback2.png",
  },
  {
    title: "Payment",
    path: "/payment",
    image: "/payment2.png",
  },
];

const W2Home = () => {
  const [search] = useSearchParams();
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
          <Stack width="100%" spacing={2}>
            {links.map((link) => (
              <W2HomeCard type="w2" key={link.title} {...link} />
            ))}
          </Stack>
        </div>
      </Container>
      <Container maxWidth="sm">
        <div className={classes.buttonContainer}>
          <W2Button onClick={handleCallWaieter} loading={isLoading}>
            Call the waiter
          </W2Button>
        </div>
      </Container>
    </>
  );
};

export default W2Home;
