import React, { useEffect, useMemo, useState } from "react";
import cls from "./checkout.module.scss";
import { IAddress, IShop2, OrderFormValues, Payment } from "interfaces";
import CheckoutPayment from "containers/checkoutPayment/checkoutPayment";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import { FormikErrors, useFormik } from "formik";
import { useSettings } from "contexts/settings/settings.context";
import orderService from "services/order";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { selectUserCart } from "redux/slices/userCart";
import BonusCaption from "components/bonusCaption/bonusCaption";
import paymentService from "services/payment";
import { error, success, warning } from "components/alert/toast";
import { useTranslation } from "react-i18next";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import getFirstValidDate from "utils/getFirstValidDate";
import { selectOrder } from "redux/slices/order";
import { EXTERNAL_PAYMENTS } from "constants/constants";
import { useAuth } from "contexts/auth/auth.context";
import Script from "next/script";
import Loading from "../../components/loader/loading";

type Props = {
  data: IShop2;
  children: any;
  onPhoneVerify: () => void;
};

export default function CheckoutContainer({
  data,
  children,
  onPhoneVerify,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { address, location } = useSettings();
  const latlng = location;
  const { user } = useAuth();
  const { replace } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const cart = useAppSelector(selectUserCart);
  const { order } = useAppSelector(selectOrder);
  const { isOpen } = useShopWorkingSchedule(data);
  const queryClient = useQueryClient();
  const [payFastUrl, setPayFastUrl] = useState("");
  const [payFastWebHookWaiting, setPayFastWebHookWaiting] = useState(false);

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const { data: payments } = useQuery(
    "payments",
    () => paymentService.getPaymentsForUser2(),
    {
      cacheTime: 0, // cache saxlanmır
      staleTime: 0, // hər dəfə stale olur
    },
  );

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

  useEffect(() => {
    if (paymentType) {
      formik.setFieldValue("payment_type", paymentType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      coupon: undefined,
      partial_payment: null, // Qismən ödəmə sahəsi əlavə edildi
      location: {
        latitude: latlng?.split(",")[0],
        longitude: latlng?.split(",")[1],
      },
      address: {
        address,
        office: "",
        house: "",
        floor: "",
      },
      delivery_date: order.delivery_date || getFirstValidDate(data).date,
      delivery_time: order.delivery_time || getFirstValidDate(data).time,
      delivery_type: "pickup",
      note: undefined,
      payment_type: paymentType,
      for_someone: false,
      username: undefined,
      phone: isUsingCustomPhoneSignIn ? user.phone : undefined,
      notes: {},
      tips: undefined,
      partial_amount: 0,
    },
    // enableReinitialize: true,
    onSubmit: (values: OrderFormValues) => {
      console.log({ values });

      const trimmedPhone = values.phone?.replace(/[^0-9]/g, "");
      if (!values.payment_type) {
        warning(t("choose.payment.method"));
        return;
      }
      if (!isOpen) {
        warning(t("shop.closed"));
        return;
      }
      if (isUsingCustomPhoneSignIn && !trimmedPhone) {
        warning(t("phone.invalid"));
        return;
      }
      if (values.for_someone) {
        if (!values.username || !values.phone) {
          warning(t("user.details.empty"));
          return;
        }
        if (!trimmedPhone) {
          warning(t("phone.invalid"));
          return;
        }
      }

      if (!user?.lastname) {
        console.log("user.details.incomplete");
        warning(t("user.details.incomplete"));
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
        return;
      }

      // Qismən ödəmə yoxlanışı
      if (
        values.partial_payment?.is_partial &&
        values.payment_type?.tag !== "cash"
      ) {
        warning(t("partial.payment.requires.cash"));
        return;
      }

      const notes = Object.keys(values.notes).reduce((acc: any, key) => {
        const value = values.notes[key]?.trim()?.length
          ? values.notes[key]
          : undefined;
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const payload: any = {
        ...values,
        currency_id: currency?.id,
        rate: currency?.rate,
        shop_id: data.id,
        cart_id: cart.id,
        payment_type: undefined,
        for_someone: undefined,
        phone: values.for_someone
          ? trimmedPhone
          : isUsingCustomPhoneSignIn
            ? trimmedPhone
            : user?.phone,
        username: values.for_someone ? values.username : undefined,
        delivery_time: values.delivery_time?.split(" - ")?.at(0),
        coupon:
          values?.coupon && values.coupon.length > 0
            ? values?.coupon
            : undefined,
        note: values?.note && values?.note?.length ? values?.note : undefined,
        notes,
        tips: values?.tips,
        // Qismən ödəmə məlumatlarını payload-a əlavə et
        partial_payment: values.partial_payment,
      };

      // Qismən ödəmə üçün xüsusi işləmə
      if (values.partial_payment?.is_partial) {
        console.log("Partial payment detected:", values.partial_payment);
        // Qismən ödəmə halında payment_id cash payment-in id-si olmalıdır
        const cashPayment = paymentTypes?.find(
          (p: Payment) => p.tag === "cash",
        );
        if (cashPayment) {
          payload.payment_id = cashPayment.id;
        }
      } else if (
        EXTERNAL_PAYMENTS.includes(formik.values.payment_type?.tag || "")
      ) {
        console.log("metod:", formik.values.payment_type);
        console.log("ife dusdu");

        externalPay({
          name: formik.values.payment_type?.tag,
          data: payload,
        });
        return; // External payment halında return et
      } else {
        console.log("else dusdu odero olanda");
        payload.payment_id = values.payment_type?.id;
      }

      createOrder(payload);
    },
    validate: (values) => {
      console.log("validate yoxlanilir");
      const errors: any = {};

      // if (
      //   (!values.address?.office || values.address.office.trim() === "") &&
      //   (!values.address?.house || values.address.house.trim() === "")
      // ) {
      //   errors.address = {
      //     office: t("validation.required"),
      //     house: t("validation.required"),
      //   };
      // }

      // Qismən ödəmə yoxlanışları
      if (values.partial_payment?.is_partial) {
        if (
          !values.partial_payment.paid_amount ||
          values.partial_payment.paid_amount <= 0
        ) {
          errors.partial_payment = t("please.enter.valid.amount");
        }
      }

      return errors;
    },
  });

  const { isLoading, mutate: createOrder } = useMutation({
    mutationFn: (data: any) => orderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile"], { exact: false });
      queryClient.invalidateQueries(["cart"], { exact: false });

      // Qismən ödəmə uğurlu mesajı
      if (formik.values.partial_payment?.is_partial) {
        success(t("partial.payment.order.created"));
      }

      replace(`/orders/${data.data.id}`);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: any) =>
      paymentService.payExternal(payload.name, payload.data),
    onSuccess: (data, payload) => {
      console.log({ payload });
      console.log({ data });

      if (payload.name === "pay-fast") {
        if (data?.data?.data?.sandbox) {
          console.log("if one");

          setPayFastUrl(
            `https://sandbox.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        } else {
          console.log("else two");

          setPayFastUrl(
            `https://www.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        }
      } else {
        console.log("else three");

        window.location.replace(data.data.data.url);
      }
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  useEffect(() => {
    if (payFastUrl) {
      const script = document.createElement("script");
      script.src = payFastUrl;
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.payfast_do_onsite_payment) {
          // @ts-ignore
          window.payfast_do_onsite_payment(
            {
              uuid: payFastUrl.split("uuid=")[1],
            },
            (result: boolean) => {
              if (result) {
                success(t("payment.success"));
              } else {
                error(t("payment.failed"));
              }
              setPayFastWebHookWaiting(true);
              setTimeout(() => {
                setPayFastWebHookWaiting(false);
                router.replace("/orders");
              }, 10000);
            },
          );
        }
      };
      document.body.appendChild(script);
      setPayFastUrl("");
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [payFastUrl]);

  return (
    <>
      {payFastWebHookWaiting && (
        <div className={cls.overlay}>
          <Loading />
        </div>
      )}
      <div className={cls.root}>
        <div className={cls.container}>
          <div className="container">
            <div className={cls.header}>
              <ShopLogoBackground data={data} />
              <div className={cls.shop}>
                <h1 className={cls.title}>{data?.translation.title}</h1>
                <p className={cls.text}>
                  {data?.bonus ? (
                    <BonusCaption data={data?.bonus} />
                  ) : (
                    data?.translation?.description
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <section className={cls.wrapper}>
            <main className={cls.body}>
              {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                  data,
                  formik,
                  onPhoneVerify,
                });
              })}
            </main>
            <aside className={cls.aside}>
              <CheckoutPayment
                formik={formik}
                shop={data}
                loading={isLoading || externalPayLoading}
                payments={paymentTypes}
                onPhoneVerify={onPhoneVerify}
                orderCount={orderCount}
              />
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
