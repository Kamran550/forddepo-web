import Container from "@mui/material/Container";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher.js";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import classes from "./payment-box.module.css";
import FormControlLabel from "@mui/material/FormControlLabel";
import { RadioInput } from "../radio-input/index.js";
import FormControl from "@mui/material/FormControl";
import { createTransactionRequest } from "../../services/transaction.js";
import LoadingIcon from "../../assets/icons/loading.jsx";
import { BottomSheet } from "react-spring-bottom-sheet";
import { useState } from "react";
import Button from "@mui/material/Button";
import PaymentSplit from "../payment-split/payment-split.jsx";
import { useSettings } from "../../context/settings/provider.jsx";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { createPortal } from "react-dom";

export function PaymentBox({
  order,
  onSuccess,
  tipAmount,
  refetchOrder,
  totalUnpaidAmount,
}) {
  const [selectedPayment, setSelectedPayment] = useState();
  const { data } = useQuery(["payments"], () =>
    fetcher("v1/rest/payments").then((res) => res.json()),
  );
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitPaymentLinks, setSplitPaymentLinks] = useState([]);
  const [isOrderRefetching, setIsOrderRefetching] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorToastOpen, setErrorToastOpen] = useState(false);

  const handleCloseToast = () => {
    setToastOpen(false);
    setErrorToastOpen(false);
  };

  const { settings } = useSettings();
  const minSplit = settings.split_min || 1;

  const paymentMethods =
    data?.data.filter((method) => method.tag !== "wallet") || [];

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload) => {
      const isNotSplit = payload.data.split === 1;
      const processType = isNotSplit ? "order" : "split";
      if (isNotSplit) {
        delete payload.data.split;
      }

      return fetcher(
        `v1/rest/${processType}-${payload.name}-process`,
        payload.data,
      ).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw res.json();
        }
      });
    },
    onSuccess: (data, variables) => {
      // onSuccess(data);
      window.sessionStorage.setItem("selected-method", variables.name);
      console.log("response =>", data.data?.[0]?.data?.url);

      if (Array.isArray(data.data)) {
        if (data.data?.length > 1) {
          setIsOrderRefetching(true);
          refetchOrder().finally(() => setIsOrderRefetching(false));
          setSplitPaymentLinks(data.data);
        } else {
          window.location.replace(data.data?.[0]?.data?.url);
        }
      } else {
        window.location.replace(data.data?.data.url);
      }
    },
    onError: (err) => {
      setErrorToastOpen(true);
      console.error("err =>", err?.data?.message);
    },
  });

  const { isLoading: isTransactionLoading, mutate: createTransaction } =
    useMutation({
      mutationFn: (payload) =>
        createTransactionRequest(
          { orderId: payload.orderId, tipAmount },
          {
            payment_sys_id: payload.paymentSysId,
          },
        ),
      onSuccess: (data) => {
        setTimeout(() => onSuccess(data), 1000);
        sessionStorage.setItem("selected-method", "cash");
        console.log("response =>", data);
        setToastOpen(true);
      },
    });
  const isLoading =
    externalPayLoading || isTransactionLoading || isOrderRefetching;
  const handleCreatePayment = (method, splitCount = minSplit) => {
    const isExternal = method !== "cash";

    const data = {
      order_id: order?.id,
      split: splitCount,
    };
    if (tipAmount) data.after_payment_tips = tipAmount;
    if (isExternal) {
      externalPay({
        name: method,
        data,
      });
    } else {
      const cashMethod = paymentMethods.find((method) => method.tag === "cash");
      createTransaction({ orderId: order?.id, paymentSysId: cashMethod?.id });
    }
  };

  return (
    <>
      <Container maxWidth="sm" className={classes.container}>
        {createPortal(
          <Snackbar
            anchorOrigin={{ horizontal: "center", vertical: "top" }}
            open={toastOpen}
            autoHideDuration={10000}
            onClose={handleCloseToast}
            style={{ position: "fixed" }}
          >
            <Alert
              onClose={handleCloseToast}
              sx={{ width: "100%" }}
              severity="info"
            >
              Admin needs to approve the payment
            </Alert>
          </Snackbar>,
          document.body,
        )}
        {createPortal(
          <Snackbar
            anchorOrigin={{ horizontal: "center", vertical: "top" }}
            open={errorToastOpen}
            autoHideDuration={2000}
            onClose={handleCloseToast}
            style={{ position: "fixed" }}
          >
            <Alert sx={{ width: "100%" }} severity="error">
              Something went wrong!
            </Alert>
          </Snackbar>,
          document.body,
        )}
        <Stack spacing={1} px={1}>
          <div className={classes.flexbox}>
            <Typography
              px={2}
              variant="subtitle1"
              fontSize={18}
              fontWeight={600}
              mb={1.5}
            >
              Choose a payment method
            </Typography>
          </div>
          <FormControl sx={{ px: "1rem", width: "calc(100% - 2rem)", mb: 2 }}>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              onChange={(e) => setSelectedPayment(e.target.value)}
              value={selectedPayment}
              sx={{ gap: "10px" }}
              style={{ maxWidth: "100%" }}
            >
              {paymentMethods.map((method) => (
                <FormControlLabel
                  key={method.id}
                  className={classes.card}
                  value={method.tag}
                  control={<RadioInput />}
                  label={method.tag}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <div className={classes.btnWrapper}>
            {!settings?.new_order_after_payment && (
              <Button
                disabled={!selectedPayment || selectedPayment === "cash"}
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => setIsSplitOpen(true)}
              >
                Split the bill
              </Button>
            )}
            <Button
              disabled={!selectedPayment}
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handleCreatePayment(selectedPayment)}
            >
              Pay full bill
            </Button>
          </div>
        </Stack>
        {isLoading && (
          <div className={classes.loadingBox}>
            <Stack my={10} alignItems="center">
              <LoadingIcon size={40} />
            </Stack>
          </div>
        )}
        <BottomSheet open={isSplitOpen} onDismiss={() => setIsSplitOpen(false)}>
          <PaymentSplit
            isLoading={isLoading}
            splitPaymentLinks={splitPaymentLinks}
            order={order}
            onSplitCancel={() => setIsSplitOpen(false)}
            totalUnpaidAmount={totalUnpaidAmount}
            onSplitConfirm={(splitCount) => {
              handleCreatePayment(selectedPayment, splitCount);
              setIsSplitOpen(false);
            }}
          />
        </BottomSheet>
      </Container>
    </>
  );
}
