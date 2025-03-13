import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import classes from "./w2-order.module.css";
import { useCartContext } from "../../../context/cart/provider";
import { W2OrderCard } from "../../../components/w2-order-card";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { formatPrice } from "../../../utils/format-price";
import { W2Button } from "../../../components/w2-button";
import ChevronLeft from "../../../assets/icons/chevron-left";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrderRequest } from "../../../services/order";
import { fetcher } from "../../../utils/fetcher";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useSettings } from "../../../context/settings/provider.jsx";
import { STORAGE_KEYS } from "../../../config/constants";

const W2Order = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const [note, setNote] = useState("");
  const { settings } = useSettings();
  const [hasError, setHasError] = useState(false);
  const { data: currencies } = useQuery(["currencylist"], () =>
    fetcher("v1/rest/currencies").then((res) => res.json()),
  );
  const { cart, clearCart, total_amount } = useCartContext();
  const type = pathname.includes("w3") ? "w3" : "w2";

  const {
    mutate: createOrder,
    isLoading,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: (data) => createOrderRequest(data),
  });

  const errorMessage =
    Object.values(error || {})?.[0]?.[0] || "Cannot create order";

  console.log("error1", error);
  const handleCreateOrder = async (deliveryType) => {
    if (isLoading) return;
    const defaultCurrency = currencies?.data.find(
      (currency) => currency.default,
    );
    const products = cart.map((cartItem) => ({
      stock_id: cartItem.stock.id,
      quantity: cartItem.stock.amount,
      addons: cartItem.addons?.map((addon) => ({
        stock_id: addon.stock.id,
        quantity: addon.quantity,
      })),
    }));

    // const addons = cart.flatMap((cartItem) =>
    //   cartItem.addons?.map((addon) => ({
    //     stock_id: addon.stock.id,
    //     quantity: addon.quantity,
    //     parent_id: addon.parent_id,
    //   })),
    // );
    const data = {
      currency_id: defaultCurrency.id,
      rate: defaultCurrency.rate,
      table_id: searchParams.get("table_id"),
      shop_id: searchParams.get("shop_id"),
      delivery_type: deliveryType,
      products: products,
      note: note.length > 0 ? note : undefined,
    };

    createOrder(data, {
      onSuccess: ({ data: newOrder }) => {
        if (settings.new_order_after_payment === true) {
          localStorage.setItem(STORAGE_KEYS.LAST_ORDER_ID, newOrder.id);
        }
        clearCart();
        navigate(`/${type}/payment` + search);
      },
      onError() {
        setHasError(true);
      },
    });
  };
  useEffect(() => {
    if (cart.length < 1 && !isSuccess) {
      navigate(`/${type}/menu` + search, { replace: true });
    }
  }, [cart.length, navigate, isSuccess]);
  // if (isSuccess) {
  //   return (
  //     <Stack
  //       alignItems="center"
  //       justifyContent="center"
  //       height="100vh"
  //       color="white"
  //     >
  //       <Stack justifyContent="center" alignItems="center" gap={4}>
  //         <Stack
  //           width={50}
  //           height={50}
  //           p={4}
  //           sx={{
  //             borderRadius: "50%",
  //             backgroundColor: "var(--color-w2primary)",
  //           }}
  //         >
  //           <AnimatedCheckIcon isVisible={isSuccess} />
  //         </Stack>
  //         <Typography color="black" variant="h5" textAlign="center">
  //           Order successfully created
  //         </Typography>
  //         <W2Button onClick={() => navigate(-1)}>Back to menu</W2Button>
  //       </Stack>
  //     </Stack>
  //   );
  // }
  return (
    <div className="w2-container">
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={isSuccess}
        autoHideDuration={6000}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Order successfully created
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={hasError}
        autoHideDuration={5000}
        onClose={() => setHasError(false)}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      {/*<BottomSheet*/}
      {/*  open={true}*/}
      {/*  onDismiss={handleClose}*/}
      {/*  className={classes.modal}*/}
      {/*>*/}
      {/*  <DeliveryType*/}
      {/*    deliveryType={selectedDelivery}*/}
      {/*    onChange={(value) => {*/}
      {/*      console.log('value', value);*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</BottomSheet>*/}
      <Container maxWidth="sm">
        <Stack
          px={2}
          direction="row"
          py={"14px"}
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontSize={18} fontWeight={600}>
            Your orders
          </Typography>
          <button onClick={() => clearCart()} className={classes.clearButton}>
            Clear
          </button>
        </Stack>
        <Stack px={2} pb={30}>
          {cart.map((cartItem, idx) => (
            <W2OrderCard data={cartItem} key={cartItem?.id} idx={idx} />
          ))}
          <Stack spacing="1.25rem" my={4}>
            <input
              className={classes.noteInput}
              placeholder="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              min={0}
            />
          </Stack>
        </Stack>
      </Container>
      <div className={classes.summary}>
        {/*<Stack direction="row" py={2} justifyContent="space-between">*/}
        {/*  <Typography variant="subtitle1">Subtotal</Typography>*/}
        {/*  <Typography variant="subtitle1">*/}
        {/*    {formatPrice(total_price)}*/}
        {/*  </Typography>*/}
        {/*</Stack>*/}
        {/*<Stack direction="row" py={2} justifyContent="space-between">*/}
        {/*  <Typography variant="subtitle1">Tax</Typography>*/}
        {/*  <Typography variant="subtitle1">*/}
        {/*    {formatPrice(total_tax)}*/}
        {/*  </Typography>*/}
        {/*</Stack>*/}
        <Stack
          direction="row"
          py={2}
          // borderTop="1px solid #898989"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">
            {formatPrice(total_amount)}
          </Typography>
        </Stack>
        <Stack gap="10px" direction="row" justifyContent="space-between">
          <button
            disabled={isLoading}
            onClick={() => navigate(-1)}
            className={classes.backButton}
          >
            <ChevronLeft />
          </button>
          <W2Button
            loading={isLoading}
            onClick={() => handleCreateOrder("dine_in")}
          >
            Continue{" "}
            {`${settings.order_payment === "before" ? "to payment" : ""}`} —{" "}
            {formatPrice(total_amount)}
          </W2Button>
        </Stack>
      </div>
    </div>
  );
};

export default W2Order;
