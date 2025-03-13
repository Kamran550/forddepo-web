import { useState } from "react";
import classes from "./search.module.css";
import Container from "@mui/material/Container";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../../../utils/fetcher";
import { extractData } from "../../../utils/extract-data";
import { FoodCard } from "../../../components/food-card";
import { W2ProductCard } from "../../../components/w2-food-card";
import { W2FoodDetail } from "../../../components/w2-food-detail";
import productListClasses from "../../../components/product-list/product-list.module.css";
import { useDebounce } from "../../../hooks/use-debounce";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const queryClient = useQueryClient();
  const [params]  = useSearchParams()
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue);
  const [selectedFood, setSelectedFood] = useState(null);
  const { data, isLoading } = useInfiniteQuery(
    ["productlist", debouncedValue],
    ({ pageParam = 1 }) =>
      fetcher("v1/rest/products/paginate", {
        search: debouncedValue,
        page: pageParam,
        shop_id: params.get('shop_id')
      }).then((res) => res.json())
  );
  const products = extractData(data?.pages);
  const handleOpenDetail = (product) => {
    queryClient.setQueryData(["productdetail", product.uuid], {
      data: product,
    });
    setSelectedFood(product.uuid);
  };
  return (
    <div className={`${classes.wrapper}`}>
      {!!selectedFood && (
        <W2FoodDetail
          open={!!selectedFood}
          onDismiss={() => setSelectedFood(null)}
          id={selectedFood}
        />
      )}
      <div className={classes.fieldWrapper}>
        <input
          placeholder="Search products"
          className={classes.field}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <Container maxWidth="sm">
        <div style={{ padding: "0 0.5rem" }}>
          <div
            className={`${productListClasses.wrapper} ${productListClasses.two} `}
          >
            {isLoading
              ? Array.from(Array(10).keys()).map((product) => (
                  <FoodCard.Loading mini key={product} />
                ))
              : products?.map((product) => (
                  <W2ProductCard
                    product={product}
                    key={product.id}
                    onFoodClick={(product) => handleOpenDetail(product)}
                  />
                ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Search;
