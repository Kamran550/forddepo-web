import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { W2Header } from "../../../components/w2-header";
import { CategoryNav } from "../../../components/category-nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { SHOP_ID } from "../../../config/site-settings";
import { fetcher } from "../../../utils/fetcher";
import { Banners } from "../../../components/banner/banners";
import { ProductList } from "../../../components/product-list/product-list";
import { useState } from "react";
import { W2FoodDetail } from "../../../components/w2-food-detail";
import { TableName } from "../../../components/table-name/index.js";

const W2Menu = () => {
  const [searchParams] = useSearchParams();
  const [selectedFood, setSelectedFood] = useState(null);
  const [isRecommendedVisible, setIsRecommendedVisible] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const queryClient = useQueryClient();
  const shopId = searchParams.get("shop_id") || SHOP_ID;
  const handleOpenDetail = (product) => {
    queryClient.setQueryData(["productdetail", product.uuid], {
      data: product,
    });
    setSelectedFood(product.uuid);
  };
  const { data, isLoading } = useQuery(
    ["productlist"],
    ({ pageParam = 1 }) =>
      fetcher(`v1/rest/shops/${shopId}/products`, {
        page: pageParam,
        shop_id: shopId,
      }).then((res) => res.json()),
    {
      onSuccess(data) {
        setFilteredProducts(data?.data?.all);
      },
    },
  );

  const productsByCategory = data?.data?.all;

  const handleSearch = (search = "") => {
    const filtered = [];
    if (search) {
      setIsRecommendedVisible(false);
    } else {
      setIsRecommendedVisible(true);
    }

    for (let i = 0; i < productsByCategory?.length; i++) {
      const category = productsByCategory?.[i];
      const categoryWithoutProduct = {
        ...productsByCategory?.[i],
        products: [],
      };
      for (let j = 0; j < category?.products?.length; j++) {
        const product = category?.products?.[j];
        if (
          product?.translation?.title
            ?.toLowerCase()
            ?.includes(search?.toLowerCase())
        ) {
          categoryWithoutProduct?.products?.push(product);
        }
      }
      if (categoryWithoutProduct?.products?.length) {
        filtered?.push(categoryWithoutProduct);
      }
    }
    setFilteredProducts(filtered);
  };

  return (
    <Container className="w2-container" maxWidth="sm">
      <W2FoodDetail
        open={!!selectedFood}
        onDismiss={() => setSelectedFood(null)}
        id={selectedFood}
      />
      <W2Header onSearchChange={handleSearch} type="w3" />

      <CategoryNav categories={productsByCategory} loading={isLoading} />
      <Banners type="w3" />
      <TableName />
      {isRecommendedVisible && (
        <ProductList
          products={data?.data?.recommended}
          id="recommended"
          title="Recommended"
          onFoodClick={(product) => handleOpenDetail(product)}
          loading={isLoading}
        />
      )}

      <Stack spacing={1.5}>
        {filteredProducts?.map((productByCategory) => (
          <ProductList
            id={productByCategory.uuid}
            title={productByCategory.translation?.title}
            products={productByCategory.products}
            key={productByCategory.id}
            onFoodClick={(product) => handleOpenDetail(product)}
            loading={isLoading}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default W2Menu;
