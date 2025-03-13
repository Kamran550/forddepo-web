import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { W2ProductCard } from "../w2-food-card";
import { FoodCard } from "../food-card";
import { useLocation } from "react-router-dom";
import classes from "./product-list.module.css";

export const ProductList = ({ products, title, id, onFoodClick, loading }) => {
  const { pathname } = useLocation();
  const itemsCount = pathname.includes("w3") ? "two" : "one";
  return (
    <div id={id}>
      <Stack spacing={1.25} px={2}>
        <Typography variant="h6" fontWeight={600}>
          {loading ? <Skeleton width="40%" /> : title}
        </Typography>
        <div className={`${classes.wrapper} ${classes[itemsCount]}`}>
          {loading
            ? Array.from(Array(4).keys()).map((product) => (
                <FoodCard.Loading mini key={product} />
              ))
            : products?.map((product) => (
                <W2ProductCard
                  product={product}
                  loading={false}
                  key={product.id}
                  onFoodClick={onFoodClick}
                />
              ))}
        </div>
      </Stack>
    </div>
  );
};
