import React, {useEffect} from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useCartContext } from "../../context/cart/provider";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import { fetcher } from "../../utils/fetcher";
import LoadingIcon from "../../assets/icons/loading";
import { formatPrice } from "../../utils/format-price";
import { useState } from "react";
import { OrderCard } from "../../components/order-card";
import { BackButton } from "../../components/back-button/back-button";
import classes from "./order.module.css";

import MuiAlert from "@mui/material/Alert";
import { createOrderRequest } from "../../services/order";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert ref={ref} variant="filled" {...props} />;
});

const Order = () => {
  const { search } = useLocation();
  const [searchParams] = useSearchParams();
  const [note, setNote] = useState("");
  const { data: currencies } = useQuery(["currencylist"], () =>
    fetcher("v1/rest/currencies").then((res) => res.json())
  );
  const { cart, clearCart, total_amount, total_items } = useCartContext();
  const [isError, setIsError] = useState(false);
  const { mutate: createOrder, isLoading, isSuccess } = useMutation({
    mutationFn: (data) => createOrderRequest(data),
    onError: () => {
      setIsError(true);
    },
  });
  const handleClose = () => {
    setIsError(false);
  };
  const navigate = useNavigate();
  const handleCreateOrder = async () => {
    if (isLoading) return;
    const defaultCurrency = currencies?.data.find(
      (currency) => currency.default
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
      delivery_type: "dine_in",
      note: note.length > 0 ? note : undefined,
      products: products,
    };

    createOrder(data, {
      onSuccess: () => {
        clearCart();
        navigate(`/payment` + search);
      },
    });

  };

  useEffect(() => {
    if (cart.length < 1 && !isSuccess) {
      navigate(-1);
    }
  }, [cart.length, navigate]);

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
  //             backgroundColor: "var(--color-primary)",
  //           }}
  //         >
  //           <AnimatedCheckIcon isVisible={isSuccess} />
  //         </Stack>
  //         <Typography color="primary" variant="h5" textAlign="center">
  //           Order successfully created
  //         </Typography>
  //       </Stack>
  //     </Stack>
  //   );
  // }

  // const prevOrdersTotalPrice = prevOrders?.data?.details?.reduce(
  //   (acc, curr) => acc + curr.total_price,
  //   0
  // );

  return (
    <Container maxWidth="sm">
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={isError}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Error occured during create order
        </Alert>
      </Snackbar>
      <Stack gap={2} px={1} pb={2}>
        <BackButton title="Order" />
        {cart.map((product, idx) => (
          <OrderCard key={product.id} product={product} idx={idx} />
        ))}
        <Stack spacing="1.25rem" my={2}>
          <input
            className={classes.noteInput}
            placeholder="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            min={0}
          />
        </Stack>
        {/*{prevOrderLoading && (*/}
        {/*  <Stack my={10} alignItems="center">*/}
        {/*    <LoadingIcon size={40} />*/}
        {/*  </Stack>*/}
        {/*)}*/}
        {/*{prevOrders?.data && (*/}
        {/*  <Typography variant="subtitle1">Previously ordered items</Typography>*/}
        {/*)}*/}
        {/*{prevOrders?.data?.details.map((detail) => (*/}
        {/*  <OrderCard*/}
        {/*    key={detail.id}*/}
        {/*    isComplete*/}
        {/*    product={{*/}
        {/*      ...detail.stock.product,*/}
        {/*      amount: detail.quantity,*/}
        {/*      stock: {*/}
        {/*        total_price: detail.stock.total_price,*/}
        {/*      },*/}
        {/*    }}*/}
        {/*  />*/}
        {/*))}*/}
        <Stack
          sx={{
            borderRadius: "1rem",
            backgroundColor: "var(--color-gray-hover)",
          }}
          p={2}
          gap={2}
        >
          {/*{prevOrders?.data?.details && (*/}
          {/*  <Stack*/}
          {/*    direction="row"*/}
          {/*    alignItems="center"*/}
          {/*    justifyContent="space-between"*/}
          {/*  >*/}
          {/*    <Typography variant="h6" fontWeight={500}>*/}
          {/*      Previous orders amount*/}
          {/*    </Typography>*/}
          {/*    <Typography variant="h6" fontWeight={500}>*/}
          {/*      {formatPrice(prevOrdersTotalPrice)}*/}
          {/*    </Typography>*/}
          {/*  </Stack>*/}
          {/*)}*/}
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
          {/*<Stack*/}
          {/*  direction="row"*/}
          {/*  alignItems="center"*/}
          {/*  justifyContent="space-between"*/}
          {/*>*/}
          {/*  <Typography variant="h6" fontWeight={500}>*/}
          {/*    Total tax*/}
          {/*  </Typography>*/}
          {/*  <Typography variant="h6" fontWeight={500}>*/}
          {/*    {formatPrice(total_tax)}*/}
          {/*  </Typography>*/}
          {/*</Stack>*/}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={500}>
              Total amount
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              {formatPrice(total_amount)}
            </Typography>
          </Stack>
        </Stack>
        <Button
          size="large"
          disabled={isLoading}
          variant="contained"
          onClick={handleCreateOrder}
        >
          {isLoading ? <LoadingIcon size={26} /> : "Checkout"}
        </Button>
      </Stack>
    </Container>
  );
};

export default Order;
