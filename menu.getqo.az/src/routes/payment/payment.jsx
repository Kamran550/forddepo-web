import { BackButton } from "../../components/back-button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { OrderCard } from "../../components/order-card";
import { Backdrop, CircularProgress, Container } from "@mui/material";
import { formatPrice } from "../../utils/format-price";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { useSearchParams } from "react-router-dom";
import LoadingIcon from "../../assets/icons/loading";
import { useSettings } from "../../context/settings/provider.jsx";
import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import { PaymentBox } from "../../components/payment-box/payment-box.jsx";
import Button from "@mui/material/Button";
import classes from "../w3/payment/payment.module.css";
import MoneyIcon from "../../assets/icons/money.jsx";
import { SplitPaymentButtons } from "../../components/payment-split/payment-split.jsx";
import { formatOrderDetails } from "../../utils/format-order-details.js";
import { deleteProductFromOrder } from "../../services/order.js";
import { STORAGE_KEYS } from "../../config/constants.js";

const tips = [0, 5, 10, 15, 20];

const Payment = () => {
  const [params] = useSearchParams();
  const { settings } = useSettings();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [isListeningOrder, setIsListeningOrder] = useState(true);
  const [userClosedPayment, setUserClosedPayment] = useState(false);
  const [customTip, setCustomTip] = useState("");
  const [selectedTip, setSelectedTip] = useState(null);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const orderURL = (() => {
    if (typeof settings?.new_order_after_payment !== "boolean") return "";
    if (settings?.new_order_after_payment) {
      return `v1/rest/orders/${localStorage.getItem(STORAGE_KEYS.LAST_ORDER_ID)}`;
    } else {
      return `v1/rest/orders/table/${params.get("table_id")}`;
    }
  })();

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery(
    ["orderlist"],
    () => fetcher(orderURL).then((res) => res.json()),
    {
      refetchOnWindowFocus: true,
      refetchInterval: 3000,
      staleTime: 0,
      enabled: isListeningOrder && !!orderURL,
      onSuccess: (data) => {
        console.log("status =>", data?.data?.status);
        if (data.data === null) return setIsListeningOrder(false);
        if (
          sessionStorage.getItem("selected-method") !== "cash" &&
          (data?.data?.status === "delivered" ||
            settings.order_payment === "before")
        ) {
          handlePaymentOpen();
        }
      },
    },
  );
  const { mutate: deleteOrderedProduct } = useMutation({
    mutationFn: (id) => deleteProductFromOrder({ ids: [id] }),
  });

  const paymentSplitted = order?.data?.payment_processes?.length > 0;
  const { paidItems, unpaidItems, totalPaidAmount, isAllTransactionsPaid } =
    formatOrderDetails(order?.data);

  const hasAllSplitsPaid = (() => {
    const allSplitLinks = order?.data?.transactions
      ?.filter((item) => item.children && item.children.length > 0)
      .flatMap((item) => item.children);

    return order?.data?.payment_processes.every((item) =>
      allSplitLinks.some((link) => link.payment_trx_id === item.id),
    );
  })();

  useEffect(() => {
    if (paymentSplitted || !hasAllSplitsPaid) {
      setUserClosedPayment(true);
    }
  }, [params, paymentSplitted, hasAllSplitsPaid]);

  const handlePaymentClose = (closedByUser) => {
    setPaymentVisible(false);
    if (closedByUser) setUserClosedPayment(true);
  };

  const handlePaymentOpen = (openedByUser) => {
    setPaymentVisible(true);
    if (openedByUser) setUserClosedPayment(false);
  };

  const isPaymentBoxVisible =
    paymentVisible && !userClosedPayment && !isAllTransactionsPaid;
  const total_items = order?.data?.details?.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const total_price = order?.data?.total_price;

  // const total_price = order?.data?.details?.reduce(
  //   (acc, curr) => acc + curr.total_price,
  //   0,
  // );

  const isOrderDelivered = order?.data?.status === "delivered";

  const isPayBtnVisible =
    (settings.order_payment === "after" &&
      order?.data?.status === "delivered") ||
    (settings.order_payment === "before" && !isAllTransactionsPaid);

  if (isLoading) {
    return (
      <>
        <BackButton />
        <Stack my={10} alignItems="center">
          <LoadingIcon size={40} />
        </Stack>
      </>
    );
  }

  if (!order?.data || (isOrderDelivered && isAllTransactionsPaid)) {
    return (
      <>
        <BackButton />
        <Container maxWidth="sm">
          <Typography variant="h5" textAlign="center">
            There is nothing to see
          </Typography>
        </Container>
      </>
    );
  }

  const actualTipAmount =
    (order?.data?.total_price / 100) * selectedTip || +customTip || 0;
  const totalUnpaidAmount = total_price + actualTipAmount - totalPaidAmount;

  return (
    <>
      <Backdrop
        sx={() => ({ color: "#fff", zIndex: 999999 })}
        open={isLoaderVisible}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <BackButton disabled={!hasAllSplitsPaid} />
      <BottomSheet
        open={isPaymentBoxVisible}
        onDismiss={() => handlePaymentClose(true)}
      >
        <PaymentBox
          tipAmount={actualTipAmount}
          onSuccess={handlePaymentClose}
          order={order?.data}
          refetchOrder={refetch}
          totalUnpaidAmount={totalUnpaidAmount}
        />
      </BottomSheet>
      <Container maxWidth="sm">
        {paidItems.length > 0 && (
          <Stack px={1} gap={1} mb={2} alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              Already paid items
            </Typography>
            {paidItems?.map((detail) => {
              return (
                <OrderCard
                  key={detail.id}
                  isComplete
                  product={{
                    ...detail.stock.product,
                    amount: detail?.quantity,
                    addons: detail.addons,
                    stock: {
                      total_price: detail?.stock?.total_price,
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}
        {unpaidItems.length > 0 && (
          <Stack px={1} gap={1} mb={2} alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              Unpaid items
            </Typography>
            {unpaidItems?.map((detail) => {
              return (
                <OrderCard
                  key={detail.id}
                  isComplete
                  deleteFunc={
                    hasAllSplitsPaid
                      ? () => {
                          setIsLoaderVisible(true);
                          deleteOrderedProduct(detail.id, {
                            onSuccess: () => {
                              refetch().finally(() =>
                                setIsLoaderVisible(false),
                              );
                            },
                            onError: () => {
                              setIsLoaderVisible(false);
                            },
                          });
                        }
                      : undefined
                  }
                  product={{
                    ...detail.stock.product,
                    amount: detail?.quantity,
                    addons: detail.addons,
                    stock: {
                      total_price: detail?.stock?.total_price,
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}
        <Stack
          style={{
            border: "1px solid var(--color-gray-hover)",
            margin: "0 0 1rem 0",
            borderRadius: "10px",
          }}
        >
          {isOrderDelivered && (
            <Stack className={classes.tipWrapper} px={2} spacing="1.25rem">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <div className={classes.moneyWrapper}>
                  <MoneyIcon />
                </div>

                <Typography variant="subtitle1" fontWeight={600}>
                  Would you like to leave a tip?
                </Typography>
              </Stack>
              <input
                type="number"
                className={classes.moneyInput}
                onFocus={() => setSelectedTip(null)}
                placeholder="Custom tip amount"
                value={!customTip && customTip !== 0 ? "" : customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                min={0}
              />
              <Stack
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                {tips.map((tip) => (
                  <button
                    onClick={() => {
                      setSelectedTip(tip);
                      setCustomTip(undefined);
                    }}
                    className={`${classes.tip} ${
                      tip === selectedTip ? classes.active : ""
                    }`}
                    key={tip}
                  >
                    {tip === 0 ? "No" : `%${tip}`}
                  </button>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
        <Stack
          sx={{
            borderRadius: "1rem",
            backgroundColor: "var(--color-gray-hover)",
          }}
          p={2}
          gap={2}
          mx={1}
          mb={5}
        >
          {order?.data?.note && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" fontWeight={500}>
                Note
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {order?.data?.note}
              </Typography>
            </Stack>
          )}
          {order?.data?.waiter && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" fontWeight={500}>
                Waiter
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {order?.data.waiter.firstname} {order?.data.waiter.lastname}
              </Typography>
            </Stack>
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Total items
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {total_items}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Service fee
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(order?.data?.service_fee)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Tax
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(order?.data?.tax)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Tip
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(actualTipAmount)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Already paid amount
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(totalPaidAmount)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Unpaid amount
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(total_price + actualTipAmount - totalPaidAmount)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Total amount
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(total_price + actualTipAmount)}
            </Typography>
          </Stack>
        </Stack>
        {!hasAllSplitsPaid && (
          <SplitPaymentButtons
            splitPaymentLinks={order?.data?.payment_processes}
            transactionChildren={order?.data?.transaction?.children || []}
            orderId={order?.data?.id}
            renderItem={(props, splitLink, idx) => (
              <Button key={splitLink.id} {...props}>
                Person {idx + 1}
              </Button>
            )}
          />
        )}
        {hasAllSplitsPaid && isPayBtnVisible && (
          <Stack>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handlePaymentOpen(true)}
            >
              Pay now
            </Button>
          </Stack>
        )}
      </Container>
    </>
  );
};

export default Payment;
