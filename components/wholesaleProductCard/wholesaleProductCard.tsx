import React from "react";
import cls from "./wholesaleProductCard.module.scss";
import { Product } from "interfaces";
import getImage from "utils/getImage";
import Price from "components/price/price";
import Badge from "components/badge/badge";
import FallbackImage from "components/fallbackImage/fallbackImage";

type Props = {
  data: Product;
  handleOpen: (event: any, data: Product) => void;
};

export default function WholesaleProductCard({ data, handleOpen }: Props) {
  const oldPrice = data.stock?.tax
    ? data.stock?.price + data.stock?.tax
    : data.stock?.price;

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
