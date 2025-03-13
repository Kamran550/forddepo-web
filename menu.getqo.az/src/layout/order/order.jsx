import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import { useEffect, useState } from "react";
import { Link, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { BottomSheet } from "react-spring-bottom-sheet";
import { useCartContext } from "../../context/cart/provider";
import classes from "./order.module.css";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { OrderCard } from "../../components/order-card";
import { formatPrice } from "../../utils/format-price";
import Wallet from "../../assets/icons/wallet";
import { useCurrencyContext } from "../../context/currency/provider.jsx";

export const OrderLayout = () => {
  const { pathname, search } = useLocation();
  const { total_items, cart, total_amount, showOrderLink } = useCartContext();
  const [open, setOpen] = useState(false);
  const { setCurrency, setDefaultCurrency } = useCurrencyContext();
  const isNotOrderPage =
      pathname === "/menu" ||
      pathname === "/w2/menu" ||
      pathname === "/w3/menu" ||
      pathname === "/w2/promotion" ||
      pathname === "/w3/promotion" ||
      pathname === "/w2/search" ||
      pathname === "/w3/search";

  const isNewView = pathname.includes("w2") || pathname.includes("w3");
  const type = pathname.includes("w3")
      ? "/w3"
      : pathname.includes("w2")
          ? "/w2"
          : "";
  const { data: currency } = useQuery(["currencylist"], () =>
      fetcher("v1/rest/currencies").then((res) => res.json()),
  );

  useEffect(() => {
    if (currency?.data) {
      const defaultCurrency = currency?.data.find(
          (currency) => currency?.default,
      );
      setDefaultCurrency(defaultCurrency);
      setCurrency(currency?.data);
      localStorage.setItem("defaultCurrency", JSON.stringify(defaultCurrency));
    }
  }, [currency]);

  useEffect(() => {
    if (cart.length < 1) {
      setOpen(false);
    }
  }, [cart.length]);

  const paymentLinkOverlayed = type === "" && total_items > 0;

  return (
      <>
        <Outlet />
        <ScrollRestoration />
        {isNotOrderPage && (
            <>
              <Link to={{ pathname: `${type}/payment`, search }}>
                <div
                    style={{ bottom: paymentLinkOverlayed ? "80px" : "30px" }}
                    className={classes.rightWrapper}
                >
                  <Wallet />
                </div>
              </Link>
              {isNewView ? (
                  <Slide
                      direction="up"
                      mountOnEnter
                      unmountOnExit
                      in={total_items > 0 || showOrderLink}
                  >
                    {!(showOrderLink && total_items < 1) ? (
                        <Link to={{ pathname: `${type}/order`, search }}>
                          <div className={classes.wrapper}>
                            <Typography fontWeight={600}>Ordering</Typography>
                            <div className={classes.price}>
                              {formatPrice(total_amount)}
                            </div>
                          </div>
                        </Link>
                    ) : (
                        <div></div>
                    )}
                  </Slide>
              ) : (
                  <Slide
                      direction="up"
                      mountOnEnter
                      unmountOnExit
                      in={total_items > 0}
                  >
                    <button className={classes.link} onClick={() => setOpen(true)}>
                      <Typography>View order</Typography>
                      <Typography>
                        {total_items} {total_items < 2 ? "product" : "products"} (
                        {formatPrice(total_amount)})
                      </Typography>
                    </button>
                  </Slide>
              )}
              <BottomSheet
                  onDismiss={() => setOpen(false)}
                  header={<Typography variant="h6">Order</Typography>}
                  expandOnContentDrag
                  open={open}
                  footer={
                    <Container maxWidth="sm">
                      <Button
                          onClick={() => setOpen(false)}
                          variant="contained"
                          fullWidth
                          component={Link}
                          size="large"
                          to={{ pathname: "/order", search }}
                      >
                        Go to checkout
                      </Button>
                    </Container>
                  }
              >
                <Container maxWidth="sm">
                  <Stack px={1} gap={2} my={2}>
                    {cart.map((product, idx) => (
                        <OrderCard key={product.id} product={product} idx={idx} />
                    ))}
                  </Stack>
                </Container>
              </BottomSheet>
            </>
        )}
      </>
  );
};
