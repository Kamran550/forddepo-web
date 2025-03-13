import { Controller, useForm } from "react-hook-form";
import { BackButton } from "../../components/back-button";
import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useMutation } from "@tanstack/react-query";
import { BASE_URL, SHOP_ID } from "../../config/site-settings";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingIcon from "../../assets/icons/loading";
import { AnimatedCheckIcon } from "../../components/animated-checkicon/animated-checkicon";
import { useState } from "react";

const sendFeedbackRequest = async (id, data) => {
  const res = await fetch(`${BASE_URL}v1/rest/shops/review/${id}`, {
    headers: { "Content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.status === 200) {
    return res.json();
  }
  throw Error;
};

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { control, handleSubmit } = useForm();
  const [isError, setIsError] = useState(false);
  const {
    mutate: sendFeedback,
    isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: (data) =>
      sendFeedbackRequest(searchParams.get("shop_id") || SHOP_ID, data),
    onSuccess: (res) => {
      console.log(res.data);
    },
    onError: () => {
      setIsError(true);
    },
  });

  const handleSendFeedback = (data) => {
    const params = {
      comment: `${data?.name}, ${data?.phone}, ${data?.description}`,
      rating: data?.rate || 5,
    };
    sendFeedback(params);
  };

  const handleClose = () => {
    setIsError(false);
  };

  if (isSuccess) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100vh"
        color="white"
      >
        <Stack justifyContent="center" alignItems="center" gap={4}>
          <Stack
            width={50}
            height={50}
            p={4}
            sx={{
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <AnimatedCheckIcon isVisible={isSuccess} />
          </Stack>
          <Typography color="primary" variant="h5" textAlign="center">
            Feedback successfully recieved
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)} size="large">
            Back to menu
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={isError}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Error occured during send feedback
        </Alert>
      </Snackbar>
      <BackButton />
      <Container maxWidth="sm">
        <Stack px={2}>
          <Typography sx={{ my: 4 }} variant="h5">
            Write a feedback
          </Typography>
          <form onSubmit={handleSubmit(handleSendFeedback)}>
            <Stack gap="1rem">
              <Controller
                control={control}
                name="name"
                rules={{ required: "required" }}
                render={({ field, formState: { errors } }) => (
                  <TextField
                    {...field}
                    label="Name"
                    size="small"
                    helperText={errors.name?.message}
                    error={!!errors.name?.type}
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                rules={{ required: "required" }}
                render={({ formState: { errors }, field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    size="small"
                    multiline
                    rows={4}
                    helperText={errors.description?.message}
                    error={!!errors.description?.type}
                  />
                )}
              />
              <Controller
                control={control}
                rules={{ required: "required" }}
                name="phone"
                render={({ formState: { errors }, field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    size="small"
                    helperText={errors.phone?.message}
                    error={!!errors.phone?.type}
                  />
                )}
              />
            </Stack>
            <Button
              disabled={isLoading}
              type="submit"
              sx={{ my: 4 }}
              fullWidth
              size="large"
              variant="contained"
            >
              {isLoading ? (
                <LoadingIcon
                  style={{ paddingBottom: "3px", paddingTop: "3px" }}
                />
              ) : (
                "Send"
              )}
            </Button>
          </form>
        </Stack>
      </Container>
    </>
  );
};

export default Feedback;
