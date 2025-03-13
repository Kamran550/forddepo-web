import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LazyLoadImage } from "react-lazy-load-image-component";
import classes from "./food-card.module.css";
import IconButton from "@mui/material/IconButton";
import PlusIcon from "../../assets/icons/plus";
import MinusIcon from "../../assets/icons/minus";
import Grow from "@mui/material/Grow";
import Skeleton from "@mui/material/Skeleton";
import { formatPrice } from "../../utils/format-price";
import { useCartContext } from "../../context/cart/provider";

export const FoodCard = ({ product, onFoodClick }) => {
  const { cart, removeItem, toggleAmount } = useCartContext();
  const InList = cart.findLast((item) => item.id === product.id);

  return (
    <article
      role="button"
      onClick={() => onFoodClick(product)}
      className={classes.card}
    >
      <div className={classes.cardImage}>
        <LazyLoadImage
          alt={product?.translation?.title}
          src={product?.img}
          effect="blur"
        />
      </div>
      <Stack mb={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight={600} variant="body1">
            {product?.translation.title}
          </Typography>
        </Stack>
        <Typography my={1} variant="body2" color="gray" className="line-clamp">
          {product?.translation.description}
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" gap={2} alignItems="flex-end">
            <Typography fontWeight={600} variant="h4" color="primary">
              {formatPrice(product?.stock?.total_price)}
            </Typography>
            {/* <Typography
              sx={{ textDecoration: "line-through" }}
              variant="h6"
              color="gray">
              $3
            </Typography> */}
          </Stack>
          <Stack direction="row">
            <Grow
              in={!!InList}
              style={{
                transformOrigin: "center right",
                position: "absolute",
                right: 0,
              }}
              unmountOnExit
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <IconButton
                  color="primary"
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    InList?.stock.amount <= product?.min_qty
                      ? removeItem(product?.stock.id)
                      : toggleAmount(product?.stock.id, "dec");
                  }}
                >
                  <MinusIcon />
                </IconButton>
                <Typography fontWeight={500} variant="body1" color="primary">
                  {InList?.stock.amount}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAmount(product?.stock.id, "inc");
                  }}
                  color="primary"
                  size="large"
                >
                  <PlusIcon />
                </IconButton>
              </Stack>
            </Grow>
            <Grow in={!InList} style={{ transformOrigin: "center left" }}>
              <div>
                <IconButton
                  // onClick={(e) => {
                  //   e.stopPropagation();
                  //   addToCart(product);
                  // }}
                  size="large"
                  className={classes.addIcon}
                >
                  <PlusIcon />
                </IconButton>
              </div>
            </Grow>
          </Stack>
        </Stack>
      </Stack>
    </article>
  );
};

const FoodCardLoading = ({ mini }) => (
  <article className={classes.card}>
    <div className={classes.cardImage}>
      <Skeleton
        variant="rectangular"
        animation="wave"
        width="100%"
        height="100%"
      />
    </div>
    <Stack mb={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={600} variant="body1">
          <Skeleton width={160} />
        </Typography>
        {mini || (
          <Typography variant="body1" color="gray">
            <Skeleton width={60} />
          </Typography>
        )}
      </Stack>
      <Typography variant="body2" color="gray">
        <Skeleton width="80%" />
      </Typography>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" gap={2} alignItems="flex-end">
          <Typography fontWeight={600} variant="h6">
            <Skeleton width={60} />
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </article>
);

FoodCard.Loading = FoodCardLoading;
