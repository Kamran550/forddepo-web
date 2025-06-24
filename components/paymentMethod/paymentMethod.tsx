import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RadioInput from "components/inputs/radioInput";
import cls from "./paymentMethod.module.scss";
import { Payment } from "interfaces";

type Props = {
  value?: string;
  list: Payment[];
  handleClose: () => void;
  onSubmit: (tag?: string) => void;
  isButtonLoading?: boolean;
  orderCount: number;
};

export default function PaymentMethod({
  value,
  list,
  orderCount,
  onSubmit,
  isButtonLoading = false,
}: Props) {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState(value);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
    onSubmit(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "payment_method",
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.wrapper}>
      <div className={cls.body}>
        {list.map((item) => {
          const isDisabled = orderCount < 3 && item.tag !== "odero";
          const control = controlProps(item.tag);
          return (
            <div
              key={item.id}
              className={`${cls.row} ${isDisabled ? cls.disabled : ""}`}
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              <RadioInput {...control} disabled={isDisabled} />
              <label className={cls.label} htmlFor={item.tag}>
                <span className={cls.text}>
                  {item.tag === "cash" || item.tag === "wallet"
                    ? t(item.tag)
                    : t("card")}
                </span>
              </label>
            </div>
          );
        })}
        {orderCount < 3 && (
          <div className={cls.info}>
            <p className={cls.note}>{t("only.card.allowed.until.3.orders")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
