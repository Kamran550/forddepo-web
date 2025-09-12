import React, { useMemo, useState } from "react";
import PrimaryButton from "components/button/primaryButton";
import BankCardLineIcon from "remixicon-react/BankCardLineIcon";
import Coupon3LineIcon from "remixicon-react/Coupon3LineIcon";
import HandCoinLineIcon from "remixicon-react/HandCoinLineIcon";
import cls from "./checkoutPayment.module.scss";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useAppSelector } from "hooks/useRedux";
import { selectUserCart } from "redux/slices/userCart";
import { useQuery } from "react-query";
import orderService from "services/order";
import Price from "components/price/price";
import Loading from "components/loader/loading";
import { IShop, IShop2, OrderFormValues, Payment } from "interfaces";
import { FormikProps } from "formik";
import { DoubleCheckIcon } from "components/icons";
import Coupon from "components/coupon/coupon";
import PaymentMethod from "components/paymentMethod/paymentMethod";
import { useAuth } from "contexts/auth/auth.context";
import { warning, error } from "components/alert/toast";
import { selectCurrency } from "redux/slices/currency";
import { useSettings } from "contexts/settings/settings.context";
import TipWithoutPayment from "components/tip/tipWithoutPayment";
import ModalContainer from "../modal/modal";
import FaqItem from "containers/faq/faqItem";

const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

type Props = {
  formik: FormikProps<OrderFormValues>;
  loading?: boolean;
  payments: Payment[];
  onPhoneVerify: () => void;
  shop?: IShop2;
  orderCount: number;
};

type OrderType = {
  bonus_shop?: any;
  coupon_price?: number;
  delivery_fee?: number;
  price?: number;
  total_discount?: number;
  total_price?: number;
  total_shop_tax?: number;
  total_tax?: number;
  service_fee?: number;
  tips?: number;
  delivery_info?: string;
  service_fee_info?: string;
};

export default function CheckoutPayment({
  formik,
  loading = false,
  payments = [],
  orderCount,
  onPhoneVerify,
  shop,
}: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { user } = useAuth();
  const [
    paymentMethodDrawer,
    handleOpenPaymentMethod,
    handleClosePaymentMethod,
  ] = useModal();
  const [promoDrawer, handleOpenPromo, handleClosePromo] = useModal();
  const [openTip, handleOpenTip, handleCloseTip] = useModal();
  const [
    partialPaymentModal,
    handleOpenPartialPayment,
    handleClosePartialPayment,
  ] = useModal();

  const cart = useAppSelector(selectUserCart);
  const currency = useAppSelector(selectCurrency);
  const defaultCurrency = useAppSelector(
    (state) => state.currency.defaultCurrency,
  );
  const [order, setOrder] = useState<OrderType>({});
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showServiceFeeInfo, setShowServiceFeeInfo] = useState(false);
  const [calculateError, setCalculateError] = useState<null | boolean>(null);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [isPartialPayment, setIsPartialPayment] = useState(false);

  const { coupon, location, delivery_type, payment_type, tips } = formik.values;
  const { settings } = useSettings();

  // Wholesale müştəri yoxlanışı
  const isWholesaleCustomer = user?.role === "wholesale_customer";

  const payload = useMemo(
    () => ({
      address: location,
      type: delivery_type,
      coupon,
      currency_id: currency?.id,
      tips: tips,
    }),
    [location, delivery_type, coupon, currency, tips],
  );

  const { isLoading } = useQuery(
    ["calculate", payload, cart],
    () => orderService.calculate(cart.id, payload),
    {
      onSuccess: (data) => {
        setOrder(data.data);
        setCalculateError(false);
      },
      onError: (err: any) => {
        setCalculateError(true);
        error(err.data?.message);
      },
      staleTime: 0,
      enabled: !!cart.id,
    },
  );

  // Qismən ödəmə modal handlers
  const handlePartialPaymentSubmit = () => {
    const amount = parseFloat(partialAmount);
    const totalPrice = Number(order.total_price) || 0;

    if (!amount || amount <= 0) {
      warning(t("please.enter.valid.amount"));
      return;
    }

    if (amount >= totalPrice) {
      warning(t("partial.amount.must.be.less.than.total"));
      return;
    }

    // DÜZƏLIŞ: Formik-ə qismən ödəmə məlumatlarını düzgün formatda əlavə et
    formik.setFieldValue("partial_payment", {
      is_partial: true,
      paid_amount: amount,
      // due_amount: totalPrice - amount, // Bu frontend üçün göstərimdir
      // total_price: totalPrice,
    });

    // Payment method-u cash olaraq təyin et
    const cashPayment = payments?.find((item) => item.tag === "cash");
    if (cashPayment) {
      formik.setFieldValue("payment_type", cashPayment);
    }

    setIsPartialPayment(true);
    handleClosePartialPayment();
  };

  const handleResetPartialPayment = () => {
    setIsPartialPayment(false);
    setPartialAmount("");
    formik.setFieldValue("partial_payment", null);
  };

  function handleOrderCreate() {
    const localShopMinPrice =
      ((currency?.rate || 1) * (shop?.min_amount || 1)) /
      (defaultCurrency?.rate || 1);
    if (!user?.phone && settings?.before_order_phone_required === "1") {
      onPhoneVerify();
      return;
    }
    if (payment_type?.tag === "wallet") {
      if (Number(order.total_price) > Number(user.wallet?.price)) {
        warning(t("insufficient.wallet.balance"));
        return;
      }
    }

    // Qismən ödəmə yoxlanışı
    if (isPartialPayment && payment_type?.tag !== "cash") {
      warning(t("partial.payment.requires.cash"));
      return;
    }

    formik.handleSubmit();
  }

  const handleAddTips = (number: number) => {
    formik.setFieldValue("tips", number);
    handleCloseTip();
  };

  // Ödəniləcək məbləği hesabla
  const paymentAmount = isPartialPayment
    ? parseFloat(partialAmount)
    : Number(order.total_price);

  const dueAmount = isPartialPayment
    ? Number(order.total_price) - parseFloat(partialAmount)
    : 0;

  console.log({ order });

  return (
    <div className={cls.card}>
      <div className={cls.cardHeader}>
        <h3 className={cls.title}>{t("payment")}</h3>
        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <BankCardLineIcon />
            <span className={cls.text}>
              {payment_type ? (
                payment_type.tag === "cash" || payment_type.tag === "wallet" ? (
                  <span style={{ textTransform: "capitalize" }}>
                    {t(payment_type?.tag)}
                  </span>
                ) : (
                  <span style={{ textTransform: "capitalize" }}>
                    {t("card")}
                  </span>
                )
              ) : (
                t("payment.method")
              )}
            </span>{" "}
          </div>
          <button
            className={cls.action}
            onClick={handleOpenPaymentMethod}
            disabled={isPartialPayment}
          >
            {t("edit")}
          </button>
        </div>

        {/* Qismən ödəmə seçimi - yalnız wholesale müştərilər üçün */}
        {isWholesaleCustomer && (
          <div className={cls.flex}>
            <div className={cls.flexItem}>
              <HandCoinLineIcon />
              <span className={cls.text}>
                {isPartialPayment ? (
                  <span style={{ color: "#28a745" }}>
                    {t("partial.payment.active")}
                  </span>
                ) : (
                  t("partial.payment")
                )}
              </span>
            </div>
            <button
              className={cls.action}
              onClick={
                isPartialPayment
                  ? handleResetPartialPayment
                  : handleOpenPartialPayment
              }
            >
              {isPartialPayment ? t("reset") : t("setup")}
            </button>
          </div>
        )}

        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <Coupon3LineIcon />
            <span className={cls.text}>
              {coupon ? (
                <span className={cls.coupon}>
                  {coupon} <DoubleCheckIcon />
                </span>
              ) : (
                t("promo.code")
              )}
            </span>
          </div>
          <button className={cls.action} onClick={handleOpenPromo}>
            {t("enter")}
          </button>
        </div>
        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <HandCoinLineIcon />
            <span className={cls.text}>
              {order?.tips ? (
                <span style={{ textTransform: "capitalize" }}>
                  <Price number={order?.tips} symbol={currency?.symbol} />
                </span>
              ) : (
                t("tip")
              )}
            </span>
          </div>
          <button className={cls.action} onClick={handleOpenTip}>
            {t("enter")}
          </button>
        </div>
      </div>
      <div className={cls.cardBody}>
        <div className={cls.block}>
          <div className={cls.row}>
            <div className={cls.item}>{t("subtotal")}</div>
            <div className={cls.item}>
              <Price number={order.price} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>
              {t("delivery.price")}
              {order.delivery_info && (
                <button
                  type="button"
                  className={cls.infoButton}
                  onClick={() => setShowDeliveryInfo((prev) => !prev)}
                >
                  ℹ️
                </button>
              )}
            </div>
            <div className={cls.item}>
              <Price number={order.delivery_fee} />
            </div>
          </div>
          {showDeliveryInfo && (
            <div className={cls.infoBox}>
              {order.delivery_info
                ? order.delivery_info
                : t("delivery.default.info")}
            </div>
          )}

          <div className={cls.row}>
            <div className={cls.item}>{t("total.tax")}</div>
            <div className={cls.item}>
              <Price number={order.total_tax} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>{t("discount")}</div>
            <div className={cls.item}>
              <Price number={order.total_discount} minus />
            </div>
          </div>
          {coupon ? (
            <div className={cls.row}>
              <div className={cls.item}>{t("promo.code")}</div>
              <div className={cls.item}>
                <Price number={order.coupon_price} minus />
              </div>
            </div>
          ) : (
            ""
          )}
          <div className={cls.row}>
            <div className={cls.item}>
              {t("service.fee")}
              {order.service_fee_info && (
                <button
                  type="button"
                  className={cls.infoButton}
                  onClick={() => setShowServiceFeeInfo((prev) => !prev)}
                >
                  ℹ️
                </button>
              )}
            </div>
            <div className={cls.item}>
              <Price number={order.service_fee} />
            </div>
          </div>
          {showServiceFeeInfo && (
            <div className={cls.infoBox}>
              {order.service_fee_info
                ? order.service_fee_info
                : t("service.fee.default.info")}
            </div>
          )}
          <div className={cls.row}>
            <div className={cls.item}>{t("tips")}</div>
            <div className={cls.item}>
              <Price number={order?.tips} />
            </div>
          </div>

          {/* Qismən ödəmə məlumatları */}
          {isPartialPayment && (
            <>
              <div
                className={cls.row}
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "10px",
                  marginTop: "10px",
                }}
              >
                <div className={cls.item} style={{ fontWeight: "600" }}>
                  {t("payment.breakdown")}:
                </div>
              </div>
              <div className={cls.row}>
                <div className={cls.item}>{t("paying.now")}</div>
                <div
                  className={cls.item}
                  style={{ color: "#28a745", fontWeight: "600" }}
                >
                  <Price number={paymentAmount} />
                </div>
              </div>
              <div className={cls.row}>
                <div className={cls.item}>{t("remaining.due")}</div>
                <div
                  className={cls.item}
                  style={{ color: "#dc3545", fontWeight: "600" }}
                >
                  <Price number={dueAmount} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className={cls.cardFooter}>
          <div className={cls.btnWrapper}>
            <PrimaryButton
              type="submit"
              onClick={handleOrderCreate}
              loading={loading}
              disabled={isLoading || !!calculateError}
            >
              {isPartialPayment
                ? t("continue.partial.payment")
                : t("continue.payment")}
            </PrimaryButton>
          </div>
          <div className={cls.priceBlock}>
            <p className={cls.text}>
              {isPartialPayment ? t("paying.now") : t("total")}
            </p>
            <div className={cls.price}>
              <Price number={paymentAmount} />
            </div>
          </div>
        </div>
      </div>

      {/* Qismən ödəmə modal */}
      <ModalContainer
        open={partialPaymentModal}
        onClose={handleClosePartialPayment}
      >
        {/* <div style={{ padding: "20px", minWidth: "300px" }}>
          <h3 style={{ marginBottom: "20px" }}>{t("setup.partial.payment")}</h3>
          <div style={{ marginBottom: "15px" }}>
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
            >
              {t("total.amount")}: <Price number={order.total_price} />
            </p>
            <label style={{ display: "block", marginBottom: "5px" }}>
              {t("amount.to.pay.now")}:
            </label>
            <input
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
              max={Number(order.total_price) - 0.01}
              min={0.01}
              step={0.01}
            />
            {partialAmount && (
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                {t("remaining.amount")}:{" "}
                <Price
                  number={
                    (Number(order.total_price) || 0) -
                    (parseFloat(partialAmount) || 0)
                  }
                />
              </p>
            )}
          </div>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              onClick={handleClosePartialPayment}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                background: "#fff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {t("cancel")}
            </button>
            <button
              onClick={handlePartialPaymentSubmit}
              style={{
                padding: "8px 16px",
                border: "none",
                background: "#007bff",
                color: "white",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {t("confirm")}
            </button>
          </div>
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <p>
              <strong>{t("note")}:</strong> {t("partial.payment.cash.only")}
            </p>
          </div>
        </div> */}
        <div className={cls.partialPayment}>
          <h3>{t("setup.partial.payment")}</h3>
          <div>
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
            >
              {t("total.amount")}: <Price number={order.total_price} />
            </p>
            <label>{t("amount.to.pay.now")}:</label>
            <input
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder="0.00"
              max={Number(order.total_price) - 0.01}
              min={0.01}
              step={0.01}
            />
            {partialAmount && (
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                {t("remaining.amount")}:{" "}
                <Price
                  number={
                    (Number(order.total_price) || 0) -
                    (parseFloat(partialAmount) || 0)
                  }
                />
              </p>
            )}
          </div>

          <div className={cls.actions}>
            <button onClick={handleClosePartialPayment} className={cls.cancel}>
              {t("cancel")}
            </button>
            <button onClick={handlePartialPaymentSubmit} className={cls.confirm}>
              {t("confirm")}
            </button>
          </div>

          <div className={cls.note}>
            <p>
              <strong>{t("note")}:</strong> {t("partial.payment.cash.only")}
            </p>
          </div>
        </div>
      </ModalContainer>

      {isLoading && <Loading />}

      {isDesktop ? (
        <DrawerContainer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.method")}
        >
          <PaymentMethod
            value={formik.values.payment_type?.tag}
            list={
              isPartialPayment
                ? payments.filter((p) => p.tag === "cash")
                : payments
            }
            handleClose={handleClosePaymentMethod}
            onSubmit={(tag) => {
              const payment = payments?.find((item) => item.tag === tag);
              formik.setFieldValue("payment_type", payment);
              handleClosePaymentMethod();
            }}
          />
        </DrawerContainer>
      ) : (
        <MobileDrawer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.method")}
        >
          <PaymentMethod
            value={formik.values.payment_type?.tag}
            list={
              isPartialPayment
                ? payments.filter((p) => p.tag === "cash")
                : payments
            }
            handleClose={handleClosePaymentMethod}
            onSubmit={(tag) => {
              const payment = payments?.find((item) => item.tag === tag);
              formik.setFieldValue("payment_type", payment);
              handleClosePaymentMethod();
            }}
          />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <DrawerContainer
          open={promoDrawer}
          onClose={handleClosePromo}
          title={t("add.promocode")}
        >
          <Coupon formik={formik} handleClose={handleClosePromo} />
        </DrawerContainer>
      ) : (
        <MobileDrawer
          open={promoDrawer}
          onClose={handleClosePromo}
          title={t("add.promocode")}
        >
          <Coupon formik={formik} handleClose={handleClosePromo} />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <ModalContainer open={openTip} onClose={handleCloseTip}>
          <TipWithoutPayment
            totalPrice={order?.total_price ?? 0}
            currency={currency}
            handleAddTips={handleAddTips}
          />
        </ModalContainer>
      ) : (
        <MobileDrawer open={openTip} onClose={handleCloseTip}>
          <TipWithoutPayment
            totalPrice={order?.total_price ?? 0}
            currency={currency}
            handleAddTips={handleAddTips}
          />
        </MobileDrawer>
      )}
    </div>
  );
}
