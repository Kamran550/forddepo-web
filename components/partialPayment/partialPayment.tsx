import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";
import Price from "components/price/price";
import cls from "./partialPayment.module.scss";

interface PartialPaymentProps {
  totalAmount: number;
  currentAmount: number;
  currency: any;
  onSubmit: (amount: number) => void;
  onClose: () => void;
}

export default function PartialPayment({
  totalAmount,
  currentAmount,
  currency,
  onSubmit,
  onClose,
}: PartialPaymentProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(currentAmount || 0);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");

  const remainingAmount = totalAmount - amount;
  const isValidPartialAmount = amount > 0 && amount < totalAmount;

  useEffect(() => {
    if (paymentType === "full") {
      setAmount(totalAmount);
    } else {
      setAmount(currentAmount || totalAmount * 0.3); // default 30%
    }
  }, [paymentType, totalAmount, currentAmount]);

  const handleSubmit = () => {
    if (paymentType === "full") {
      onSubmit(totalAmount);
    } else if (isValidPartialAmount) {
      onSubmit(amount);
    }
  };

  const quickAmountPercentages = [25, 30, 50, 70];

  return (
    <div className={cls.container}>
      <div className={cls.header}>
        <h3>{t("payment.options")}</h3>
        <p className={cls.totalInfo}>
          {t("order.total")}: <Price number={totalAmount} />
        </p>
      </div>

      <div className={cls.paymentOptions}>
        {/* Tam ödəniş */}
        <div
          className={`${cls.option} ${paymentType === "full" ? cls.selected : ""}`}
          onClick={() => setPaymentType("full")}
        >
          <div className={cls.radioButton}>
            <input
              type="radio"
              checked={paymentType === "full"}
              onChange={() => setPaymentType("full")}
            />
          </div>
          <div className={cls.optionContent}>
            <h4>{t("full.payment")}</h4>
            <p>{t("pay.full.amount.now")}</p>
            <div className={cls.amount}>
              <Price number={totalAmount} />
            </div>
          </div>
        </div>

        {/* Qismən ödəniş */}
        <div
          className={`${cls.option} ${paymentType === "partial" ? cls.selected : ""}`}
          onClick={() => setPaymentType("partial")}
        >
          <div className={cls.radioButton}>
            <input
              type="radio"
              checked={paymentType === "partial"}
              onChange={() => setPaymentType("partial")}
            />
          </div>
          <div className={cls.optionContent}>
            <h4>{t("partial.payment")}</h4>
            <p>{t("pay.partial.rest.credit")}</p>
          </div>
        </div>
      </div>

      {paymentType === "partial" && (
        <div className={cls.partialSection}>
          <div className={cls.quickAmounts}>
            <p>{t("quick.amounts")}:</p>
            <div className={cls.percentageButtons}>
              {quickAmountPercentages.map((percentage) => {
                const quickAmount = Math.round(
                  totalAmount * (percentage / 100),
                );

                return (
                  <button
                    key={percentage}
                    className={cls.percentageBtn}
                    onClick={() => setAmount(quickAmount)}
                  >
                    {percentage}%
                    <span className={cls.percentageAmount}>
                      <Price number={quickAmount} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={cls.customAmount}>
            <label>{t("custom.amount")}:</label>
            <div className={cls.inputWrapper}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                max={totalAmount - 1}
                className={cls.amountInput}
              />
              <span className={cls.currency}>{currency?.symbol}</span>
            </div>
          </div>

          <div className={cls.calculation}>
            <div className={cls.calcRow}>
              <span>{t("paying.now")}:</span>
              <Price number={amount} />
            </div>
            <div className={cls.calcRow}>
              <span>{t("remaining.amount")}:</span>
              <Price number={remainingAmount} />
            </div>
            <div className={cls.note}>
              <p>{t("remaining.will.be.credit")}</p>
            </div>
          </div>
        </div>
      )}

      <div className={cls.actions}>
        <button className={cls.cancelBtn} onClick={onClose}>
          {t("cancel")}
        </button>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={paymentType === "partial" && !isValidPartialAmount}
        >
          {t("confirm")}
        </PrimaryButton>
      </div>
    </div>
  );
}
