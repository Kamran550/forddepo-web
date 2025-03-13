import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { FoodCard } from "../../components/food-card";
import { fetcher } from "../../utils/fetcher";
import { SHOP_ID } from "../../config/site-settings";
import { useState } from "react";
import { FoodDetail } from "../../components/food-detial";

const Menu = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useQuery(["productlist"], () =>
    fetcher(
      `v1/rest/branch/products?shop_id=${
        searchParams.get("shop_id") || SHOP_ID
      }`
    ).then((res) => res.json())
  );
  const productList = data?.data.find(
    (product) => product.id.toString() === id
  );

  const handleOpenDetail = (product) => {
    queryClient.setQueryData(["productdetail", product.uuid], {
      data: product,
    });
    setSelectedFood(product.uuid);
  };

  if (isLoading) {
    return (
      <Stack gap={2}>
        <Typography variant="h5">
          <Skeleton width="40%" />
        </Typography>
        <FoodCard.Loading />
        <FoodCard.Loading />
        <FoodCard.Loading />
        <FoodCard.Loading />
      </Stack>
    );
  }
  return (
    <Stack gap={2} pb={40}>
      {!!selectedFood && (
        <FoodDetail
          open={!!selectedFood}
          onDismiss={() => setSelectedFood(null)}
          id={selectedFood}
        />
      )}
      <Typography variant="h5">{productList?.translation.title}</Typography>

      {productList?.products?.map((product) => (
        <FoodCard
          key={product.id}
          product={product}
          onFoodClick={(product) => handleOpenDetail(product)}
        />
      ))}
    </Stack>
  );
};

export default Menu;
