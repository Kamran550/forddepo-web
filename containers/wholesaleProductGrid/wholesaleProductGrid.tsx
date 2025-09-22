import React from "react";
import cls from "./wholesaleProductGrid.module.scss";
import { useTranslation } from "react-i18next";
import { Product } from "interfaces";
import { useAppDispatch } from "hooks/useRedux";
import { setProduct } from "redux/slices/product";
import Empty from "components/empty/empty";
import Loading from "components/loader/loader";
import WholesaleProductCard from "components/wholesaleProductCard/wholesaleProductCard";

type Props = {
  products: Product[];
  loading?: boolean;
  onProductClick?: (product: Product) => void;
};

interface GroupedProducts {
  [categoryName: string]: Product[];
}

export default function WholesaleProductGrid({
  products,
  loading,
  onProductClick,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Məhsulları kateqoriyalara görə qruplaşdır
  const groupedProducts: GroupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.translation?.title || t("other");
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as GroupedProducts);

  const handleOpenProduct = (event: any, data: Product) => {
    event.preventDefault();
    // Redux-da məhsulu və uuid-ni saxla
    dispatch(setProduct({ product: data, uuid: data.uuid }));
    onProductClick?.(data);
  };

  if (loading) {
    return (
      <div className={cls.loadingContainer}>
        <Loading />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cls.emptyContainer}>
        <Empty text={t("no.products.found")} />
      </div>
    );
  }

  return (
    <div className={cls.container}>
      {Object.entries(groupedProducts).map(
        ([categoryName, categoryProducts]) => (
          <div key={categoryName} className={cls.categorySection}>
            <h2 className={cls.categoryTitle}>{categoryName}</h2>
            <div className={cls.productsGrid}>
              {categoryProducts.map((product) => (
                <WholesaleProductCard
                  key={product.id}
                  data={product}
                  handleOpen={handleOpenProduct}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
