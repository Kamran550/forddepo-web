import React, { useMemo } from "react";
import cls from "./payToUnpaidOrders.module.scss";
import PrimaryButton from "components/button/primaryButton";
import { useMediaQuery } from "@mui/material";
import useModal from "hooks/useModal";
import dynamic from "next/dynamic";
import { useSettings } from "contexts/settings/settings.context";
import { useMutation, useQuery, useQueryClient } from "react-query";
import paymentService from "services/payment";
import {
  BASE_URL,
  EXTERNAL_PAYMENTS,
  UNPAID_STATUSES,
} from "constants/constants";
import { Order, Payment } from "interfaces";
import PaymentMethod from "components/paymentMethod/paymentMethod";
import { useTranslation } from "react-i18next";
import { error } from "components/alert/toast";
import PaymentMethod2 from "components/paymentMethod2/paymentMethod2";

const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

type Props = {
  data?: Order;
};

export default function PayToUnpaidOrders({ data }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [
    paymentMethodDrawer,
    handleOpenPaymentMethod,
    handleClosePaymentMethod,
  ] = useModal();

  const { settings } = useSettings();

  const { data: payments } = useQuery(
    "payments",
    () => paymentService.getPaymentsForUser2(),
    {
      enabled:
        UNPAID_STATUSES.includes(data?.transaction?.status || "paid") &&
        data?.transaction?.payment_system.tag !== "cash",
    },
  );

  console.log({ payments });

  // const { paymentTypes } = useMemo(() => {
  //   let defaultPaymentType: Payment | undefined;
  //   let paymentTypesList: Payment[];
  //   console.log("isAdmin:", settings?.payment_type);
  //   console.log("shop pay:", data?.shop?.shop_payments);

  //   if (settings?.payment_type === "admin") {
  //     defaultPaymentType = payments?.data.find(
  //       (item: Payment) => item.tag === "cash",
  //     );
  //     paymentTypesList = payments?.data || [];
  //   } else {
  //     defaultPaymentType = payments?.find(
  //       (item) => item.payment.tag === "cash",
  //     )?.payment;
  //     paymentTypesList =
  //       data?.shop?.shop_payments?.map((item) => item.payment) || [];
  //   }
  //   return {
  //     paymentType: defaultPaymentType,
  //     paymentTypes: paymentTypesList,
  //   };
  // }, [settings, data, payments]);

  const { paymentType, paymentTypes, orderCount } = useMemo(() => {
    const list = payments?.data || [];
    const orderCount = payments?.test?.order_count || 0;

    return {
      paymentType:
        list.find((item: Payment) => item.tag === "odero") || list[0],
      paymentTypes: list,
      orderCount,
    };
  }, [payments]);

  const { isLoading: isLoadingTransaction, mutate: transactionCreate } =
    useMutation({
      mutationFn: (data: any) =>
        paymentService.createTransaction(data.id, data.payment),
      onSuccess: () => {
        queryClient.invalidateQueries(["profile"], { exact: false });
        queryClient.invalidateQueries(["order", data?.id, i18n.language]);
      },
      onError: (err: any) => {
        error(err?.data?.message);
      },
      onSettled: () => {
        handleClosePaymentMethod();
      },
    });

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: any) =>
      paymentService.payExternal(payload.name, payload.data),
    onSuccess: (data) => {
      window.location.replace(data.data.data.url);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const payAgain = (tag: string) => {
    // const payment = paymentTypes.find((paymentType) => paymentType.tag === tag);
    // console.log("1111111111");
    const payment = paymentTypes.find((p) => p.tag === tag);
    if (!payment) {
      console.error("Payment not found! tag:", tag, paymentTypes);
      return;
    }

    const payload = {
      id: data?.id,
      payment: {
        payment_sys_id: payment?.id,
      },
    };
    if (EXTERNAL_PAYMENTS.includes(tag)) {
      console.log("ilk if");

      externalPay({ name: tag, data: { order_id: payload.id } });
    }
    console.log("menim pay again tagim:", tag);
    console.log("menim pay again payload:", payload);

    if (tag === "alipay") {
      window.location.replace(
        `${BASE_URL}/api/alipay-prepay?order_id=${payload.id}`,
      );
    }
    transactionCreate(payload);
  };

  return (
    <>
      <div className={cls.payButton}>
        <PrimaryButton onClick={handleOpenPaymentMethod} type="button">
          {t("pay")}
        </PrimaryButton>
      </div>
      {isDesktop ? (
        <DrawerContainer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.methodgg")}
        >
          <PaymentMethod2
            value={data?.transaction?.payment_system.tag}
            list={paymentTypes}
            handleClose={handleClosePaymentMethod}
            isButtonLoading={isLoadingTransaction || externalPayLoading}
            onSubmit={(tag) => {
              if (tag) {
                console.log("ife girdi tag");

                payAgain(tag);
              }
            }}
          />
        </DrawerContainer>
      ) : (
        <MobileDrawer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.methodss")}
        >
          <PaymentMethod2
            value={data?.transaction?.payment_system.tag}
            list={paymentTypes}
            handleClose={handleClosePaymentMethod}
            isButtonLoading={isLoadingTransaction || externalPayLoading}
            onSubmit={(tag) => {
              if (tag) {
                payAgain(tag);
              }
            }}
          />
        </MobileDrawer>
      )}
    </>
  );
}
