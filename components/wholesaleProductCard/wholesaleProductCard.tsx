import React from "react";
import cls from "./wholesaleProductCard.module.scss";
import { Product } from "interfaces";
import getImage from "utils/getImage";
import Price from "components/price/price";
import Badge from "components/badge/badge";
import FallbackImage from "components/fallbackImage/fallbackImage";
import { useTranslation } from "react-i18next";

type Props = {
  data: Product;
  handleOpen: (event: any, data: Product) => void;
};

export default function WholesaleProductCard({ data, handleOpen }: Props) {
  const { t } = useTranslation();

  const oldPrice = data.stock?.tax
    ? data.stock?.price + data.stock?.tax
    : data.stock?.price;

  console.log("Product data:", {
    quantity: data.stock?.quantity,
    maxQuantity: data.maxQuantity,
    stockMaxQuantity: data.stock?.maxQuantity,
    calculatedMaxStock: data.maxQuantity || data.stock?.maxQuantity || 100,
  });

  // Stock status-unu müəyyən et
  const getStockStatus = () => {
    const quantity = data.stock?.quantity || 0;

    // Backend-dən gələn maxQuantity sahəsini istifadə et
    const maxStock = data.stock?.maxQuantity || 100;
    console.log({ maxStock });

    // Stock status məntiqi: maxQuantity-ə görə faiz hesablanır
    const stockPercentage = (quantity / maxStock) * 100;
    console.log({ stockPercentage });
    if (stockPercentage < 30) {
      return {
        status: "low",
        color: "red",
        text: t("stock.low"),
        displayText: t("stock.low"),
      };
    } else if (stockPercentage >= 30 && stockPercentage <= 70) {
      return {
        status: "medium",
        color: "yellow",
        text: t("stock.medium"),
        displayText: t("stock.medium"),
      };
    } else {
      return {
        status: "good",
        color: "green",
        text: t("stock.good"),
        displayText: t("stock.good"),
      };
    }
  };

  const stockInfo = getStockStatus();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    handleOpen(event, data);
  };

  return (
    <div
      className={`${cls.wrapper} ${data.id === 0 ? cls.active : ""}`}
      onClick={handleClick}
    >
      <div className={cls.header}>
        {!!data.stock?.discount && (
          <div className={cls.discount}>
            <Badge variant="circle" type="discount" />
          </div>
        )}

        <FallbackImage
          fill
          src={getImage(data.img)}
          alt={data.translation?.title}
          sizes="320px"
          quality={90}
        />
      </div>
      <div className={cls.body}>
        <h3 className={cls.title}>{data.translation?.title}</h3>
        <p className={cls.text}>{data.translation?.description}</p>
        {data.oem_code?.length > 0 && (
          <p className={cls.text}>oem: {data.oem_code}</p>
        )}
        {/* Stock Status */}
        <div
          className={`${cls.stockStatus} ${cls[stockInfo.status]}`}
          title={stockInfo.text}
        >
          <span className={cls.stockIndicator}></span>
          <span className={cls.stockText}>
            {stockInfo.displayText}
            {data.stock?.warehouse && (
              <span className={cls.warehouse}>• {data.stock.warehouse}</span>
            )}
          </span>
        </div>
        <span className={cls.price}>
          <Price number={data.stock?.total_price} />
        </span>{" "}
        {!!data.stock?.discount && (
          <span className={cls.oldPrice}>
            <Price number={oldPrice} old />
          </span>
        )}
        <span className={cls.bonus}>
          {data.stock?.bonus && <Badge type="bonus" variant="circle" />}
        </span>
      </div>
    </div>
  );
}
