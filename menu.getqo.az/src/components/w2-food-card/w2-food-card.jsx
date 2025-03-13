import cls from "./w2-food-card.module.css";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { formatPrice } from "../../utils/format-price";
import { W2Button } from "../w2-button/w2-button";
import { Loading } from "../loading";
import { useCartContext } from "../../context/cart/provider";
import { useLocation } from "react-router-dom";

export const W2ProductCard = ({ product, loading, onFoodClick }) => {
  const { pathname } = useLocation();
  const priceInButton = pathname.includes("w3");
  const { cart, removeItem, toggleAmount } = useCartContext();
  const InList = cart.findLast((item) => item.stock.id === product.stock.id);
  const stock = product?.stocks ? product?.stocks[0] : product?.stock;

  return (
    <div
      className={`${cls.wrapper} ${InList ? cls.active : ""}`}
      role="button"
      onClick={() => onFoodClick(product)}
    >
      {loading && <Loading />}
      <div className={`${cls.header} ${priceInButton ? cls.two : ""}`}>
        <LazyLoadImage src={product.img} alt={product.translation?.title} />
      </div>
      <div className={cls.body}>
        <h3 className={cls.title}>{product.translation?.title}</h3>
        <p className={cls.text}>{product.translation?.description}</p>
      </div>
      <div className={cls.footer}>
        {!priceInButton && (
          <div>
            <span className={cls.price}>{formatPrice(stock?.total_price)}</span>{" "}
            {!!stock?.discount && (
              <span className={cls.oldPrice}>{formatPrice(stock?.price)}</span>
            )}
          </div>
        )}
        {InList ? (
          <div
            className={cls.counter}
            style={{ flex: priceInButton ? 1 : "unset" }}
          >
            <button
              type="button"
              className={cls.counterBtn}
              onClick={(e) => {
                e.stopPropagation();
                InList?.stock.amount <= 1
                  ? removeItem(stock?.id)
                  : toggleAmount(stock?.id, "dec");
              }}
            >
              <SubtractFillIcon />
            </button>
            <div className={cls.count}>{InList.stock.amount}</div>
            <button
              type="button"
              className={`${cls.counterBtn} ${
                Number(stock?.quantity) > InList.stock.amount
                  ? ""
                  : cls.disabled
              }`}
              disabled={!(Number(stock?.quantity) > InList.stock.amount)}
              onClick={(e) => {
                e.stopPropagation();
                toggleAmount(stock?.id, "inc");
              }}
            >
              <AddFillIcon />
            </button>
          </div>
        ) : priceInButton ? (
          <W2Button
            type="button"
            size="small"
            // onClick={(e) => {
            //   e.stopPropagation();
            //   addToCart(product);
            // }}
          >
            {priceInButton ? formatPrice(stock?.total_price) : "Add"}
          </W2Button>
        ) : (
          <div className={cls.addToCartBtn}>
            <W2Button
              type="button"
              size="small"
              // onClick={(e) => {
              //   e.stopPropagation();
              //   addToCart(product);
              // }}
            >
              {priceInButton ? formatPrice(stock?.total_price) : "Add"}
            </W2Button>
          </div>
        )}
      </div>
    </div>
  );
};
