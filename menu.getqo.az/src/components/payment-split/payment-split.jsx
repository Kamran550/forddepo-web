import classes from "./payment-split.module.css";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import UserLineIcon from "remixicon-react/UserLineIcon";
import AddLineIcon from "remixicon-react/AddLineIcon";
import SubtractLineIcon from "remixicon-react/SubtractLineIcon";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { formatPrice } from "../../utils/format-price.js";
import { useSettings } from "../../context/settings/provider.jsx";
import LoadingIcon from "../../assets/icons/loading.jsx";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { fetcher } from "../../utils/fetcher.js";

function PaymentSplit({
  onSplitConfirm,
  onSplitCancel,
  isLoading,
  splitPaymentLinks,
  totalUnpaidAmount,
}) {
  const { settings } = useSettings();
  const minSplit = settings.split_min || 1;
  const maxSplit = settings.split_max || 1;

  const [peopleCount, setPeopleCount] = useState(minSplit);

  const handleSplitConfirm = () => {
    onSplitConfirm(peopleCount);
  };

  return (
    <Container maxWidth="sm" className={classes.container}>
      {isLoading && (
        <div className={classes.loadingBox}>
          <Stack my={10} alignItems="center">
            <LoadingIcon size={40} />
          </Stack>
        </div>
      )}
      <Stack spacing={1} px={1}>
        <Typography
          px={2}
          variant="subtitle1"
          fontSize={18}
          fontWeight={600}
          mb={1.5}
        >
          Divide the payment equally
        </Typography>
        <div className={classes.counterWrapper}>
          <div className={classes.label}>
            <UserLineIcon />
            <Typography>Total people in your table</Typography>
          </div>

          <div className={classes.counter}>
            <IconButton
              size="small"
              onClick={() => setPeopleCount(peopleCount - 1)}
              disabled={peopleCount <= minSplit}
            >
              <SubtractLineIcon />
            </IconButton>
            <Typography variant="h6">{peopleCount}</Typography>
            <IconButton
              size="small"
              onClick={() => setPeopleCount(peopleCount + 1)}
              disabled={peopleCount >= maxSplit}
            >
              <AddLineIcon />
            </IconButton>
          </div>
        </div>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        padding="0 .4rem"
      >
        <Typography fontWeight={500}>Total amount</Typography>
        <Typography fontWeight={500}>
          {formatPrice(totalUnpaidAmount)}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        padding="0 .4rem"
      >
        <Typography>Amount per person</Typography>
        <Typography fontWeight={500}>
          {formatPrice(totalUnpaidAmount / peopleCount)}
        </Typography>
      </Stack>
      {/*<SplitPaymentButtons*/}
      {/*  splitPaymentLinks={splitPaymentLinks}*/}
      {/*  renderItem={(props, splitLink, idx) => (*/}
      {/*    <Button key={splitLink.id} {...props}>*/}
      {/*      Person {idx + 1}*/}
      {/*    </Button>*/}
      {/*  )}*/}
      {/*/>*/}
      {splitPaymentLinks.length > 1 ? (
        <SplitPaymentButtons
          splitPaymentLinks={splitPaymentLinks}
          renderItem={(props, splitLink, idx) => (
            <Button key={splitLink.id} {...props}>
              Person {idx + 1}
            </Button>
          )}
        />
      ) : (
        <Stack padding="0 .4rem">
          <div className={classes.btnWrapper}>
            <Button
              fullWidth
              size="large"
              color="error"
              variant="outlined"
              onClick={onSplitCancel}
            >
              Remove split
            </Button>
            <Button
              onClick={handleSplitConfirm}
              fullWidth
              variant="contained"
              size="large"
            >
              Confirm
            </Button>
          </div>
        </Stack>
      )}
    </Container>
  );
}

export function SplitPaymentButtons({
  splitPaymentLinks = [],
  renderItem,
  transactionChildren,
  orderId,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = (splitLink) => {
    // fetcher(`v1/rest/orders/clicked/${splitLink.id}`).finally(() => {
    window.location.replace(splitLink.data?.url);
    // });
  };

  const { isLoading: isRegeneratingLink, mutate: regenerateLink } = useMutation(
    {
      mutationFn: (payload) =>
        fetcher(`v1/rest/order-stripe-process`, payload.data).then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw res.json();
          }
        }),
      onSuccess: (data) => {
        // onSuccess(data);
        const paymentUrl = data.data?.data?.url;
        console.log("response =>", paymentUrl);
        window.location.replace(paymentUrl);

        setIsModalVisible(false);
      },
      onError: (err) => {
        console.error("err =>", err?.data?.message);
      },
    },
  );

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    if (isRegeneratingLink) return;
    setIsModalVisible(false);
  };

  const handleRegenerateLinks = () => {
    const selectedMethod = window.sessionStorage.getItem("selected-method");

    const data = {
      order_id: orderId,
      split: 1,
    };

    regenerateLink({ name: selectedMethod, data });
  };

  const paidTransactions =
    transactionChildren.filter(
      (transaction) => transaction.status === "paid",
    ) || [];

  return (
    <>
      <div className={classes.splitBtns}>
        {splitPaymentLinks.map(
          (splitLink, idx) =>
            renderItem &&
            renderItem(
              {
                variant: "contained",
                className: classes.splitBtn,
                onClick: () => handleClick(splitLink),
                disabled:
                  paidTransactions.some(
                    (transaction) =>
                      transaction?.payment_trx_id === splitLink?.id,
                  ) || isRegeneratingLink,
              },
              splitLink,
              idx,
            ),
        )}
      </div>
      <div style={{ margin: "0 5px" }}>
        <Button
          variant="contained"
          style={{
            display: "block",
            width: "100%",
          }}
          color="warning"
          onClick={handleModalOpen}
        >
          Regenerate payment link
        </Button>
      </div>
      <Dialog
        open={isModalVisible}
        onClose={handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure to regenerate payment link?
        </DialogTitle>
        {/*<DialogContent>*/}
        {/*  <DialogContentText id="alert-dialog-description">*/}
        {/*    Let Google help apps determine location. This means sending*/}
        {/*    anonymous location data to Google, even when no apps are running.*/}
        {/*  </DialogContentText>*/}
        {/*</DialogContent>*/}
        <DialogActions>
          <Button disabled={isRegeneratingLink} onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            disabled={isRegeneratingLink}
            onClick={handleRegenerateLinks}
            autoFocus
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PaymentSplit;
