import React from "react";
import cls from "./editPhone.module.scss";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import authService from "../../services/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type EditPhoneViews = "EDIT" | "VERIFY";
type Props = {
  onSuccess: (data: any) => void;
  changeView: (view: EditPhoneViews) => void;
};

interface formValues {
  phone: string;
}

export default function InsertNewPhone({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { phoneNumberSignIn, user } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "false";

  const isAzerbaijanNumber = (phone: string) => {
    return phone.startsWith("+994");
  };

  const formik = useFormik({
    initialValues: {
      phone: "",
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      const trimmedPhone = values.phone.replace(/[^0-9]/g, "");

      if (isAzerbaijanNumber(values.phone)) {
        console.log("AzerbaijanNumber");
        authService
          .resendPhone({ phone: trimmedPhone })
          .then((res) => {
            onSuccess({
              ...res,
              phone: values.phone,
              verifyId: res.data?.verifyId,
            });
            changeView("VERIFY");
          })
          // .catch((e) => {
          //   console.log("bura dusdu", e);

          //   error(t("sms not sent"));
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
        phoneNumberSignIn(values.phone)
          .then((confirmationResult) => {
            onSuccess({
              phone: trimmedPhone,
              callback: confirmationResult,
            });
            changeView("VERIFY");
          })
          .catch((err) => {
            error(t("sms.not.sent"));
            console.log("err => ", err);
          })
          .finally(() => {
            setSubmitting(false);
          });
      }

      // if (isUsingCustomPhoneSignIn) {
      //   authService
      //     .resendPhone({ phone: trimmedPhone })
      //     .then((res) => {
      //       onSuccess({
      //         ...res,
      //         phone: values.phone,
      //         verifyId: res.data?.verifyId,
      //       });
      //       changeView("VERIFY");
      //     })
      //     // .catch((e) => {
      //     //   console.log("bura dusdu", e);

      //     //   error(t("sms not sent"));
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
      //         phone: trimmedPhone,
      //         callback: confirmationResult,
      //       });
      //       changeView("VERIFY");
      //     })
      //     .catch((err) => {
      //       error(t("sms.not.sent"));
      //       console.log("err => ", err);
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
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.phone)
      )
        return errors;
    },
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("edit.phoneeee")}</h1>
      </div>
      <div className={cls.space} />
      {/* <TextInput
        name="phone"
        label={t("phone")}
        placeholder={t("type.here")}
        value={formik.values.phone}
        onChange={formik.handleChange}
        error={!!formik.errors.phone}
        helperText={formik.errors.phone}
        required
      /> */}
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
          {t("save")}
        </PrimaryButton>
      </div>
    </form>
  );
}
