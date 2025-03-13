import cls from "./w2-order-card.module.css";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import { useCartContext } from "../../context/cart/provider";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { formatPrice } from "../../utils/format-price";
import ConfirmButton from "../confirm-button/confirm-button.jsx";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel.js";

export const W2OrderCard = ({ data, disabled, idx, deleteFunc }) => {
  const { removeItem, toggleAmount } = useCartContext();

  const extras = data?.stock?.singleStockExtras;

  // const addonsPrice = data?.addons?.reduce((acc, item) => acc + item.total_price * item, 0) || 0;
  // const addonsPrice =
  //   data?.addons?.reduce(
  //     (acc, item) => acc + item.stock.total_price * item.quantity,
  //     0,
  //   ) || 0;

  return (
    <div className={cls.row}>
      <div className={cls.col}>
        <h4 className={cls.title}>
          {data?.translation?.title}{" "}
          {extras?.map((item) => `(${item?.value})`).join(", ")}
          {data.bonus && <span className={cls.red}>Bonus</span>}
        </h4>
        <p className={cls.desc}>
          {data?.addons
            ?.map(
              (item) =>
                (item?.translation?.title ||
                  item?.stock?.product?.translation?.title) +
                `(${formatPrice(item?.stock?.price)})` +
                " x " +
                item.quantity,
            )
            .join(", ")}
        </p>
        <div className={cls.actions}>
          {!disabled && (
            <div className={cls.counter}>
              <button
                type="button"
                className={`${cls.counterBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  data?.stock.amount <= 1
                    ? removeItem(data.stock.id, idx)
                    : toggleAmount(data.stock.id, "dec", idx);
                }}
              >
                <SubtractFillIcon />
              </button>
              <div className={cls.count}>{data.stock.amount}</div>
              <button
                type="button"
                className={`${cls.counterBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAmount(data.stock.id, "inc", idx);
                }}
              >
                <AddFillIcon />
              </button>
            </div>
          )}
          {deleteFunc && (
            <ConfirmButton
              content={{ title: "Are you sure to delete this product?" }}
              onConfirm={deleteFunc}
            >
              <IconButton color="error" aria-label="delete">
                <CancelIcon />
              </IconButton>
            </ConfirmButton>
          )}
          <div className={cls.price}>
            {!!data.discount && (
              <span className={cls.oldPrice}>
                {formatPrice(data.stock.price)}
              </span>
            )}
            {formatPrice(data?.stock?.total_price)}
            <sup>x {data.stock.amount}</sup>
          </div>
        </div>
      </div>
      <div className={cls.imageWrapper}>
        <LazyLoadImage src={data?.img} alt={data?.translation?.title} />
      </div>
    </div>
  );
};
