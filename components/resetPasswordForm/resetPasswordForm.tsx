import React, { useState } from "react";
import cls from "./resetPasswordForm.module.scss";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { error, success } from "components/alert/toast";
import authService from "services/auth";
import { useRouter } from "next/router";
import { useAuth } from "contexts/auth/auth.context";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type RegisterViews = "RESET" | "VERIFY";
type Props = {
  changeView: (view: RegisterViews) => void;
  onSuccess: (data: any) => void;
};

interface formValues {
  email?: string;
  phone?: string;
}

export default function ResetPasswordForm({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { phoneNumberSignIn } = useAuth();
  const [isPhoneInput, setIsPhoneInput] = useState(false); // Telefon inputu açmaq üçün state

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "false";

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      if (values.email?.includes("@")) {
        console.log("email ile forgot pass");

        authService
          .forgotPasswordEmail(values)
          .then((res: any) => {
            push({ pathname: "/verify-phone", query: { email: values.email } });
            success(res.message);
          })
          .catch((err) => error(t(err.statusCode)))
          .finally(() => setSubmitting(false));
      } else {
        console.log("phone ile forgot pass");
        const trimmedPhone = values.phone?.replace(/[^0-9]/g, "");
        if (isUsingCustomPhoneSignIn) {
          authService
            .forgotPasswordEmail({ phone: trimmedPhone })
            .then((res: any) => {
              push({
                pathname: "/verify-phone",
                query: { phone: values.phone },
              });
              onSuccess(res.message);
              changeView("VERIFY");
            })
            .catch(() => {
              error(t("sms.not.sent"));
            })
            .finally(() => {
              setSubmitting(false);
            });
        } else {
          phoneNumberSignIn(trimmedPhone || "")
            .then((confirmationResult) => {
              changeView("VERIFY");
              onSuccess({ phone: trimmedPhone, callback: confirmationResult });
            })
            .catch(() => error(t("sms.not.sent")))
            .finally(() => setSubmitting(false));
        }
      }
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.email && !values.phone) {
        errors.email = t("either.email.or.phone.required");
        errors.phone = t("either.email.or.phone.required");
        return errors;
      }

      if (values.email) {
        if (values.email?.includes(" ")) {
          errors.email = t("should.not.includes.empty.space");
        }

        if (values.email?.includes("@")) {
          if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            errors.email = t("should.be.valid");
          }
        } else if (
          !/^998([378]{2}|(9[013-57-9]))\d{7}$/i.test(
            values.email?.replace("+", "") || "",
          )
        ) {
          console.log("email");
          errors.email = t("should.be.valid");
        }
      }

      if (values.phone) {
        const trimmedPhone = values.phone?.replace(/[^0-9+]/g, ""); // `+` simvolunu saxlayırıq

        if (!trimmedPhone) {
          errors.phone = t("required");
        } else if (!/^\+?[0-9]{9,15}$/.test(trimmedPhone)) {
          errors.phone = t("should.be.valid");
        }
      }

      // if (values.email?.includes(" ")) {
      //   errors.email = t("should.not.includes.empty.space");
      // }
      // if (values.email?.includes("@")) {
      //   if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      //     errors.email = t("should.be.valid");
      //   }
      // } else if (
      //   !/^998([378]{2}|(9[013-57-9]))\d{7}$/i.test(
      //     values.email?.replace("+", "") || "",
      //   )
      // ) {
      //   console.log("email");
      //   errors.email = t("should.be.valid");
      // }

      console.log({ errors });

      return errors;
    },
  });
  const toggleInput = () => {
    setIsPhoneInput(!isPhoneInput); // Telefon və email arasında keçid edir
    formik.resetForm(); // Input dəyişdikdə formu sıfırlayır
  };

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("reset.password")}</h1>
        <p className={cls.text}>{t("reset.password.text")}</p>
      </div>
      <div className={cls.space} />
      {!isPhoneInput && (
        <>
          <TextInput
            name="email"
            label={t("email")}
            placeholder={t("type.here")}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={!!formik.errors.email}
          />
        </>
      )}

      {/* Phone input (only shown if isPhoneInput is true) */}
      {isPhoneInput && (
        <>
          <PhoneInput
            className={cls.phoneInputCustom}
            name="phone"
            label={t("phone")}
            international
            placeholder={t("type.here")}
            defaultCountry="AZ"
            value={formik.values.phone}
            onChange={(value) => formik.setFieldValue("phone", value)}
          />
        </>
      )}

      <div className={cls.space} />
      <div className={cls.action}>
        <div className={cls.link}>
          <a
            href="#"
            onClick={toggleInput} // Telefon və email arasında keçid etmək üçün
          >
            {isPhoneInput ? t("use.email") : t("use.phone.number")}
          </a>
        </div>
        <div className={cls.space} />

        <PrimaryButton
          id="sign-in-button"
          type="submit"
          loading={formik.isSubmitting}
        >
          {t("send")}
        </PrimaryButton>
      </div>
    </form>
  );
}
