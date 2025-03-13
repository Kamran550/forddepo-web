import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import classes from "./w2-food-detail.module.css";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useCartContext } from "../../context/cart/provider";
import { BottomSheet } from "react-spring-bottom-sheet";
import { formatPrice } from "../../utils/format-price";
import LoadingIcon from "../../assets/icons/loading";
import { getExtras, sortExtras } from "../../utils/get-extras";
import { useState } from "react";
import ExtrasForm from "../extrasForm/extrasForm";
import AddonsForm from "../extrasForm/addonsForm";
import { W2Button } from "../w2-button/w2-button";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";

export const W2FoodDetail = ({ id, open, onDismiss }) => {
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
        setCounter(data.min_qty || 1);
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
      parent_id: showExtras.stock.id,
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
            <div className={classes.footer}>
              <div className={classes.actions}>
                <div className={classes.counter}>
                  <button
                    type="button"
                    className={`${classes.counterBtn} ${
                      counter === 1 ? classes.disabled : ""
                    }`}
                    disabled={counter === productDetail?.data.min_qty}
                    onClick={() => setCounter((prev) => prev - 1)}
                  >
                    <SubtractFillIcon />
                  </button>
                  <div className={classes.count}>{counter}</div>
                  <button
                    type="button"
                    className={`${classes.counterBtn} ${
                      counter === stock.quantity ? classes.disabled : ""
                    }`}
                    disabled={
                      counter === stock.quantity ||
                      counter === productDetail?.data.max_qty
                    }
                    onClick={() => setCounter((prev) => prev + 1)}
                  >
                    <AddFillIcon />
                  </button>
                </div>
                <div className={classes.btnWrapper}>
                  <W2Button
                    onClick={handleAddToCart}
                    disabled={!showExtras?.stock.quantity}
                  >
                    {!showExtras?.stock.quantity ? "Out of stock" : "Add"}
                  </W2Button>
                </div>
              </div>
              <div className={classes.priceBlock}>
                <p>Total</p>
                <h5 className={classes.price}>
                  {formatPrice(calculateTotalPrice(true))}
                </h5>
              </div>
            </div>
          </Container>
        ) : null
      }
    >
      <Container maxWidth="sm">
        <Stack spacing={1} px={1}>
          <Typography fontWeight={600} variant="subtitle1">
            {productDetail?.data?.translation.title}
          </Typography>
          <div className={classes.cardImage}>
            <LazyLoadImage
              alt={productDetail?.data?.translation.title}
              effect="blur"
              src={productDetail?.data?.img}
            />
          </div>

          <Typography my={1} variant="subtitle2" color="gray">
            {productDetail?.data?.translation.description}
          </Typography>
          {isFetching ? (
            <Stack py={4} alignItems="center" justifyContent="center">
              <LoadingIcon size={40} />
            </Stack>
          ) : (
            <Stack>
              {showExtras?.extras?.map((item, idx) => (
                <ExtrasForm
                  key={"extra" + idx}
                  name={item[0].group.translation.title}
                  data={item}
                  stock={stock}
                  selectedExtra={extrasIds[idx]}
                  handleExtrasClick={handleExtrasClick}
                  type="w2"
                />
              ))}
              <AddonsForm
                data={showExtras.stock?.addons || []}
                handleAddonClick={handleAddonClick}
                quantity={counter}
                type="w2"
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </BottomSheet>
  );
};
