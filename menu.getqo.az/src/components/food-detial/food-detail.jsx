import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import classes from "./food-detail.module.css";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useCartContext } from "../../context/cart/provider";
import { BottomSheet } from "react-spring-bottom-sheet";
import { formatPrice } from "../../utils/format-price";
import MinusIcon from "../../assets/icons/minus";
import PlusIcon from "../../assets/icons/plus";
import LoadingIcon from "../../assets/icons/loading";
import { getExtras, sortExtras } from "../../utils/get-extras";
import { useState } from "react";
import ExtrasForm from "../extrasForm/extrasForm";
import AddonsForm from "../extrasForm/addonsForm";

export const FoodDetail = ({ id, open, onDismiss }) => {
  const [addons, setAddons] = useState([]);
  const [extrasIds, setExtrasIds] = useState([]);
  const [extras, setExtras] = useState([]);
  const [stock, setStock] = useState([]);
  const [counter, setCounter] = useState(1);
  const [showExtras, setShowExtras] = useState({
    extras: [],
    stock: {
      id: 0,
      quantity: 1,
      price: 0,
    },
  });
  const { addToCart } = useCartContext();
  const { data: productDetail, isFetching } = useQuery(
    ["productdetail", id],
    () => fetcher(`v1/rest/products/${id}`).then((res) => res.json()),
    {
      enabled: open,
      onSuccess: ({ data }) => {
        setCounter(data?.min_qty || 1);
        const myData = sortExtras(data);
        setExtras(myData.extras);
        setStock(myData.stock);
        setShowExtras(getExtras("", myData.extras, myData.stock));
        getExtras("", myData.extras, myData.stock).extras?.forEach(
          (element) => {
            setExtrasIds((prev) => [...prev, element[0]]);
          },
        );
      },
    },
  );

  const handleExtrasClick = (e) => {
    const index = extrasIds.findIndex(
      (item) => item.extra_group_id === e.extra_group_id,
    );
    let array = extrasIds;
    if (index > -1) array = array.slice(0, index);
    array.push(e);
    const nextIds = array.map((item) => item.id).join(",");
    var extrasData = getExtras(nextIds, extras, stock);
    setShowExtras(extrasData);
    extrasData.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0].extra_group_id != e.extra_group_id
          ? item.extra_group_id === element[0].extra_group_id
          : item.extra_group_id === e.extra_group_id,
      );
      if (element[0].level >= e.level) {
        var itemData =
          element[0].extra_group_id != e.extra_group_id ? element[0] : e;
        if (index == -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
  };

  function handleAddToCart() {
    storeCart();
    onDismiss();
  }

  function storeCart() {
    const products = addons.map((item) => ({
      id: item.id,
      img: item.img,
      translation: item.translation,
      quantity: item.stock?.quantity,
      stock: item.stock,
      shop_id: item.shop_id,
      extras: [],
    }));

    addToCart({
      ...productDetail.data,
      stock: {
        ...showExtras.stock,
        amount: counter,
        total_price: showExtras.stock?.total_price,
      },
      addons: products,
    });
  }

  function handleAddonClick(list) {
    setAddons(list);
  }

  function calculateTotalPrice(withQuantity) {
    const addonPrice = addons.reduce(
      (total, item) =>
        (total +=
          Number(item.stock?.total_price) * Number(item.stock?.quantity)),
      0,
    );

    if (withQuantity) {
      return addonPrice + Number(showExtras.stock?.total_price || 0) * counter;
    } else {
      return addonPrice + Number(showExtras.stock?.total_price || 0);
    }
  }

  return (
    <BottomSheet
      open={open}
      expandOnContentDrag
      onDismiss={onDismiss}
      footer={
        !isFetching ? (
          <Container maxWidth="sm">
            <Stack px={1} direction="row" justifyContent="space-between">
              <Stack direction="row" gap={2} alignItems="flex-end">
                <Typography fontWeight={600} variant="h4" color="primary">
                  {formatPrice(calculateTotalPrice(true))}
                </Typography>
              </Stack>
              <Stack direction="row">
                {/*{InList ? (*/}
                {/*  <Stack direction="row" alignItems="center" gap={2}>*/}
                {/*    <IconButton*/}
                {/*      className={classes.btn}*/}
                {/*      color="white"*/}
                {/*      onClick={(e) => {*/}
                {/*        e.stopPropagation();*/}
                {/*        InList.stock.amount <= productDetail?.data.min_qty*/}
                {/*          ? removeItem(showExtras.stock.id)*/}
                {/*          : toggleAmount(showExtras.stock.id, "dec");*/}
                {/*      }}*/}
                {/*    >*/}
                {/*      <MinusIcon />*/}
                {/*    </IconButton>*/}
                {/*    <Typography*/}
                {/*      fontWeight={500}*/}
                {/*      variant="body1"*/}
                {/*      color="primary"*/}
                {/*    >*/}
                {/*      {InList?.stock.amount}*/}
                {/*    </Typography>*/}
                {/*    <IconButton*/}
                {/*      className={classes.btn}*/}
                {/*      onClick={(e) => {*/}
                {/*        e.stopPropagation();*/}
                {/*        toggleAmount(showExtras.stock.id, "inc");*/}
                {/*      }}*/}
                {/*      color="white"*/}
                {/*    >*/}
                {/*      <PlusIcon />*/}
                {/*    </IconButton>*/}
                {/*  </Stack>*/}
                {/* ) : (*/}
                <Stack direction="row" alignItems="center" gap={2}>
                  <IconButton
                    className={classes.btn}
                    color="white"
                    disabled={counter === productDetail?.data.min_qty}
                    onClick={() => setCounter((prev) => prev - 1)}
                  >
                    <MinusIcon />
                  </IconButton>
                  <Typography fontWeight={500} variant="body1" color="primary">
                    {counter}
                  </Typography>
                  <IconButton
                    className={classes.btn}
                    disabled={
                      counter === stock.quantity ||
                      counter === productDetail?.data.max_qty
                    }
                    onClick={() => setCounter((prev) => prev + 1)}
                    color="white"
                  >
                    <PlusIcon />
                  </IconButton>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAddToCart}
                  className={classes.addIcon}
                  disabled={!showExtras?.stock.quantity}
                >
                  {!showExtras?.stock.quantity ? "Out of stock" : "Add"}
                </Button>
                {/*)}*/}
              </Stack>
            </Stack>
          </Container>
        ) : null
      }
    >
      <Container maxWidth="sm">
        <Stack spacing={1} px={1}>
          <div className={classes.cardImage}>
            <LazyLoadImage
              alt={productDetail?.data?.translation?.title}
              effect="blur"
              src={productDetail?.data?.img}
            />
            <div className={classes.closeBtnContainer}>
              <IconButton
                onClick={() => onDismiss()}
                className={classes.closeBtn}
              >
                <PlusIcon />
              </IconButton>
            </div>
          </div>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={600} variant="h4">
              {productDetail?.data?.translation?.title}
            </Typography>
          </Stack>
          <Typography my={1} variant="body2" color="gray">
            {productDetail?.data?.translation?.description}
          </Typography>
          {isFetching ? (
            <Stack py={4} alignItems="center" justifyContent="center">
              <LoadingIcon size={40} />
            </Stack>
          ) : (
            <Stack spacing={1}>
              {showExtras?.extras?.map((item, idx) => (
                <ExtrasForm
                  key={"extra" + idx}
                  name={item?.[0]?.group?.translation?.title}
                  data={item}
                  stock={stock}
                  selectedExtra={extrasIds[idx]}
                  handleExtrasClick={handleExtrasClick}
                />
              ))}
              <AddonsForm
                data={showExtras.stock?.addons || []}
                handleAddonClick={handleAddonClick}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </BottomSheet>
  );
};
