import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { fetcher } from "../../../utils/fetcher";
import { FoodCard } from "../../../components/food-card/food-card";
import { W2ProductCard } from "../../../components/w2-food-card";
import Container from "@mui/material/Container";
import { W2Header } from "../../../components/w2-header";
import { W2FoodDetail } from "../../../components/w2-food-detail";
import { useState } from "react";
import classes from "../../../components/product-list/product-list.module.css";

const Promotion = () => {
  const { pathname } = useLocation();
  const itemsCount = pathname.includes("w3") ? "two" : "one";
  const { id: bannerId } = useParams();
  const [selectedFood, setSelectedFood] = useState(null);
  const queryClient = useQueryClient();
  const { data: banner, isLoading } = useQuery(
    ["banner", bannerId],
    ({ pageParam = 1 }) =>
      fetcher(`v1/rest/banners/${bannerId}`, { page: pageParam }).then((res) =>
        res.json()
      )
  );
  const handleOpenDetail = (product) => {
    queryClient.setQueryData(["productdetail", product.uuid], {
      data: product,
    });
    setSelectedFood(product.uuid);
  };
  return (
    <div className="w2-container">
      {!!selectedFood && (
        <W2FoodDetail
          open={!!selectedFood}
          onDismiss={() => setSelectedFood(null)}
          id={selectedFood}
        />
      )}
      <Container maxWidth="sm">
        <W2Header />
        <div
          className={`${classes.wrapper} ${classes.section} ${classes[itemsCount]}`}
        >
          {isLoading
            ? Array.from(Array(10).keys()).map((product) => (
                <FoodCard.Loading mini key={product} />
              ))
            : banner?.data.products?.map((product) => (
                <W2ProductCard
                  product={product}
                  key={product.id}
                  onFoodClick={(product) => handleOpenDetail(product)}
                />
              ))}
        </div>
      </Container>
    </div>
  );
};

export default Promotion;
