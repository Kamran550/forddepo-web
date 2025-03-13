import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grow from "@mui/material/Grow";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlusIcon from "../../assets/icons/plus";
import { useCartContext } from "../../context/cart/provider";
import classes from "./menu-card.module.css";
import MinusIcon from "../../assets/icons/minus";
import { formatPrice } from "../../utils/format-price";

export const MenuCard = ({ product }) => {
  const { addToCart, cart, removeItem, toggleAmount } = useCartContext();
  const InList = cart.find((item) => item.id === product.id);
  return (
    <article className={classes.card}>
      <div className={classes.image}>
        <LazyLoadImage
          src={product.img}
          effect="blur"
          className={classes.image}
          alt={product.translation?.title || "product_img"}
        />
        <div className={classes.price}>
          {formatPrice(product.stock?.total_price)}
        </div>
        <div className={classes.action}>
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
                className={classes.icon}
                onClick={() =>
                  InList.amount <= product.min_qty
                    ? removeItem(product.id)
                    : toggleAmount(product.id, "dec")
                }
              >
                <MinusIcon />
              </IconButton>
              <Typography fontWeight={500} variant="body1" color="primary">
                {InList?.amount}
              </Typography>
              <IconButton
                onClick={() => toggleAmount(product.id, "inc")}
                className={classes.icon}
                size="large"
              >
                <PlusIcon />
              </IconButton>
            </Stack>
          </Grow>
          <Grow in={!InList} style={{ transformOrigin: "center left" }}>
            <div>
              <IconButton
                onClick={() => addToCart(product)}
                size="large"
                className={classes.icon}
              >
                <PlusIcon />
              </IconButton>
            </div>
          </Grow>
        </div>
      </div>
      <div className={classes.content}>
        <strong className={classes.title}>{product.translation?.title}</strong>
        <p className={classes.description}>{product.translation.description}</p>
      </div>
    </article>
  );
};
