import React from "react";
import cls from "./orderList.module.scss";
import { Order } from "interfaces";
import { Skeleton } from "@mui/material";
import OrderListItem from "components/orderListItem/orderListItem";
import Price from "components/price/price";

type Props = {
  data: Order[];
  loading?: boolean;
  active?: boolean;
};

export default function OrderList({
  data = [],
  loading = false,
  active = false,
}: Props) {
  console.log("ordersssssssss");

  const totalDebt = data.reduce((acc, order) => {
    const debt = (order.total_price ?? 0) - (order.paid_amount ?? 0);
    return acc + (debt > 0 ? debt : 0); // mənfi olmasın
  }, 0);

  console.log({ data });

  return (
    <div className={cls.root}>
      {!loading && (
        <div className={cls.totalDebt}>
          Ümumi borc:{" "}
          <strong>
            <Price number={totalDebt} symbol={data[0]?.currency?.symbol} />
          </strong>
        </div>
      )}

      {!loading
        ? data.map((item) => (
            <OrderListItem key={item.id} data={item} active={active} />
          ))
        : Array.from(new Array(3)).map((item, idx) => (
            <Skeleton
              key={"shops" + idx}
              variant="rectangular"
              className={cls.shimmer}
            />
          ))}
    </div>
  );
}
