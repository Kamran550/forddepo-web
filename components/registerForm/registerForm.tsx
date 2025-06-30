import React from "react";
import cls from "./registerForm.module.scss";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import authService from "services/auth";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import { FormLabel } from "@mui/material";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type RegisterViews = "REGISTER" | "VERIFY" | "COMPLETE";
type Props = {
  onSuccess: (data: any) => void;
  changeView: (view: RegisterViews) => void;
};

interface formValues {
  phone: string;
}

export default function RegisterForm({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { phoneNumberSignIn } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "false";

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+994/, "994"); // +994 ilə başlayan hissəni 994 ilə əvəz edir
  };

  const isAzerbaijanNumber = (phone: string) => {
    return phone.startsWith("+994");
  };

  const formik = useFormik({
    initialValues: {
      phone: "",
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      if (isAzerbaijanNumber(values.phone)) {
        console.log("AzerbaijanNumber");

        const formattedPhone = formatPhoneNumber(values.phone);
        console.log({ formattedPhone });
        console.log("value phone:", values.phone);

        authService
          .register({ phone: formattedPhone })
          .then((res) => {
            onSuccess({
              ...res,
              phone: values.phone,
              verifyId: res.data?.verifyId,
            });
            changeView("VERIFY");
          })
          // .catch((e) => {
          //   console.log({ e });

          //   error(t("error occured"));
          // })
          .catch((err) => {
            const data = err?.data;
            console.log({ data });

            if (data?.params && typeof data.params === "object") {
              Object.values(data.params)
                .flat()
                .forEach((msg) => {
                  if (msg) error(t(msg));
                });
            } else if (data?.message) {
              error(t(data.message));
            } else {
              error(t("Something went wrong"));
            }
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        console.log("xarici nomre");

        phoneNumberSignIn(values.phone)
          .then((confirmationResult) => {
            onSuccess({
              phone: values.phone,
              callback: confirmationResult,
            });
            changeView("VERIFY");
          })
          .catch((err) => {
            console.log("salam");

            error(t("sms.not.sent"));
          })
          .finally(() => {
            setSubmitting(false);
          });
      }
      // if (isUsingCustomPhoneSignIn) {
      //   const formattedPhone = formatPhoneNumber(values.phone);
      //   console.log({ formattedPhone });
      //   console.log("value phone:", values.phone);

      //   authService
      //     .register({ phone: formattedPhone })
      //     .then((res) => {
      //       onSuccess({
      //         ...res,
      //         phone: values.phone,
      //         verifyId: res.data?.verifyId,
      //       });
      //       changeView("VERIFY");
      //     })
      //     // .catch((e) => {
      //     //   console.log({ e });

      //     //   error(t("error occured"));
      //     // })
      //     .catch((err) => {
      //       const data = err?.data;
      //       console.log({ data });

      //       if (data?.params && typeof data.params === "object") {
      //         Object.values(data.params)
      //           .flat()
      //           .forEach((msg) => {
      //             if (msg) error(t(msg));
      //           });
      //       } else if (data?.message) {
      //         error(t(data.message));
      //       } else {
      //         error(t("Something went wrong"));
      //       }
      //     })
      //     .finally(() => {
      //       setSubmitting(false);
      //     });
      // } else {
      //   phoneNumberSignIn(values.phone)
      //     .then((confirmationResult) => {
      //       onSuccess({
      //         phone: values.phone,
      //         callback: confirmationResult,
      //       });
      //       changeView("VERIFY");
      //     })
      //     .catch((err) => {
      //       console.log("salam");

      //       error(t("sms.not.sent"));
      //     })
      //     .finally(() => {
      //       setSubmitting(false);
      //     });
      // }
    },

    validate: (values: formValues) => {
      const errors = {} as formValues;
      if (!values.phone) {
        errors.phone = t("required");
      }
      return errors;
    },
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("sign.up")}</h1>
        <p className={cls.text}>
          {t("have.account")} <Link href="/login">{t("login")}</Link>
        </p>
      </div>
      <div className={cls.space} />
      <FormLabel
        id="phone"
        sx={{
          fontSize: "15px",
          color: "var(--black)",
          marginBottom: "15px",
        }}
      >
        {t("phone")}
      </FormLabel>
      <PhoneInput
        className={cls.phoneInputCustom}
        name="phone"
        international
        defaultCountry="AZ"
        value={formik.values.phone}
        onChange={(value) => formik.setFieldValue("phone", value)}
      />
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          id="sign-in-button"
          type="submit"
          loading={formik.isSubmitting}
        >
          {t("sign.up")}
        </PrimaryButton>
      </div>
    </form>
  );
}
