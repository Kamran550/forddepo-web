import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { callRequest } from "../../services/call";
import { HomeCard } from "../../components/home-card";
import classes from "./home.module.css";

const Home = () => {
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

  const links = [
    {
      title: "Menu",
      path: "/menu",
      image: "/food.jpeg",
    },
    {
      title: "Feedback",
      path: "/feedback",
      image: "/food1.jpeg",
    },
    {
      title: "Call the waiter",
      onClick: () => {
        mutate({
          table_id: search.get("table_id"),
        });
      },
      image: "/salad.jpeg",
    },
    {
      title: "Payment",
      path: "/payment",
      image: "/drinks.jpeg",
    },
  ];

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
          <Grid container spacing={{ 0: 0.5, xs: 1, md: 2 }}>
            {links.map((link) => (
              <Grid key={link.title} item xs={6}>
                <HomeCard {...link} />
              </Grid>
            ))}
          </Grid>
        </div>
      </Container>
    </>
  );
};

export default Home;
