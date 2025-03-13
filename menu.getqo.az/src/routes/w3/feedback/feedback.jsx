import { Controller, useForm } from "react-hook-form";
import { Container, Rating, Stack, Typography } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useMutation } from "@tanstack/react-query";
import { BASE_URL, SHOP_ID } from "../../../config/site-settings";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatedCheckIcon } from "../../../components/animated-checkicon/animated-checkicon";
import { useState } from "react";
import { W2Header } from "../../../components/w2-header";
import { W2Button } from "../../../components/w2-button";
import { TextInput } from "../../../components/w2-input";
import StarFill from "../../../assets/icons/star-fill";
import StarEmpty from "../../../assets/icons/star-empty";

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

const W2Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { control, handleSubmit } = useForm({ defaultValues: { rating: 5 } });
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
              backgroundColor: "var(--color-w2primary)",
            }}
          >
            <AnimatedCheckIcon isVisible={isSuccess} />
          </Stack>
          <Typography color="black" variant="h5" textAlign="center">
            Feedback successfully recieved
          </Typography>
          <W2Button onClick={() => navigate(-1)} size="large">
            Back to menu
          </W2Button>
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
      <W2Header />
      <Container maxWidth="sm">
        <Stack px={2}>
          <Typography mb={4} variant="h5">
            Write a feedback
          </Typography>
          <form onSubmit={handleSubmit(handleSendFeedback)}>
            <Stack gap="1rem" mb={1}>
              <Controller
                control={control}
                name="name"
                rules={{ required: "required" }}
                render={({ field, formState: { errors } }) => (
                  <TextInput
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
                  <TextInput
                    {...field}
                    label="Description"
                    size="small"
                    multiline
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
                  <TextInput
                    {...field}
                    label="Phone"
                    size="small"
                    helperText={errors.phone?.message}
                    error={!!errors.phone?.type}
                  />
                )}
              />
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <Rating
                    name="customized-color"
                    defaultValue={2}
                    value={field.value}
                    onChange={(e, value) => field.onChange(value)}
                    sx={{ justifyContent: "space-between", mb: 2 }}
                    getLabelText={(value) =>
                      `${value} Heart${value !== 1 ? "s" : ""}`
                    }
                    precision={0.5}
                    icon={<StarFill />}
                    emptyIcon={<StarEmpty />}
                  />
                )}
              />
            </Stack>

            <W2Button type="submit" loading={isLoading}>
              Send
            </W2Button>
          </form>
        </Stack>
      </Container>
    </>
  );
};

export default W2Feedback;
