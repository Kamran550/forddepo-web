import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import classes from "./order.module.css";
import { useCartContext } from "../../../context/cart/provider";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { formatPrice } from "../../../utils/format-price";
import { W2Button } from "../../../components/w2-button";
import ChevronLeft from "../../../assets/icons/chevron-left";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrderRequest } from "../../../services/order";
import { fetcher } from "../../../utils/fetcher";
import { W3OrderCard } from "../../../components/w3-order-card/order-card";
import { useSettings } from "../../../context/settings/provider.jsx";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const W2Order = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const [note, setNote] = useState("");
  const [failMessage, setFailMessage] = useState("");
  const { data: currencies } = useQuery(["currencylist"], () =>
    fetcher("v1/rest/currencies").then((res) => res.json()),
  );
  const type = pathname.includes("w3") ? "w3" : "w2";
  const { cart, clearCart, total_amount } = useCartContext();

  const clearFailMessage = () => setFailMessage("");

  const {
    mutate: createOrder,
    isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: (data) => createOrderRequest(data),
  });
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
      onSuccess: () => {
        clearCart();
        navigate(`/${type}/payment` + search);
      },
      onError: (err) => {
        const errors = Object.values(err ?? []);
        setFailMessage(errors[0]);
      },
    });
  };
  useEffect(() => {
    if (cart.length < 1 && !isSuccess) {
      navigate(-1);
    }
  }, [cart.length, navigate, isSuccess]);
  return (
    <div className="w2-container">
      {failMessage && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={Boolean(failMessage)}
          autoHideDuration={6000}
          onClose={clearFailMessage}
        >
          <Alert
            severity="error"
            sx={{ width: "100%" }}
            onClose={clearFailMessage}
          >
            {failMessage}
          </Alert>
        </Snackbar>
      )}
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
        <Typography px={2} fontWeight={600} variant="subtitle2" my={2}>
          Table: {searchParams.get("name")}
        </Typography>
        <div className={classes.reciept}>
          <div className={classes.recieptContent}>
            {cart.map((cartItem) => (
              <W3OrderCard data={cartItem} key={cartItem.id} />
            ))}
          </div>
        </div>
        <Stack px={2} spacing="1.25rem" my={4}>
          <input
            className={classes.noteInput}
            placeholder="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            min={0}
          />
        </Stack>
      </Container>
      <div className={classes.summary}>
        <Stack direction="row" py={2} justifyContent="space-between">
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
