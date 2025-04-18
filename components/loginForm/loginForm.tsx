import React, { useState } from "react";
import cls from "./loginForm.module.scss";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import TextInput from "components/inputs/textInput";
import CheckboxInput from "components/inputs/checkboxInput";
import PrimaryButton from "components/button/primaryButton";
import PasswordInput from "components/inputs/passwordInput";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import authService from "services/auth";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import { setCookie } from "utils/session";
import { LoginCredentials } from "interfaces/user.interface";
import { Stack } from "@mui/material";
import { defaultUser } from "constants/config";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type Props = {};
interface formValues {
  email?: string;
  phone?: string;
  password: string;
  login?: string;
  keep_logged?: boolean;
}

export default function LoginForm({}: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { setUserData } = useAuth();
  const [isPhoneInput, setIsPhoneInput] = useState(false); // Telefon inputu açmaq üçün state

  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO_APP === "true";

  const formik = useFormik({
    initialValues: {
      email: "",
      phone: "",
      password: "",
      keep_logged: true,
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      let body: LoginCredentials;
      if (values.email?.includes("@")) {
        body = {
          email: values.email,
          password: values.password,
        };
      } else {
        const trimmedPhone = values.phone?.replace(/[^0-9]/g, "");
        console.log({ trimmedPhone });

        body = {
          phone: Number(trimmedPhone),
          password: values.password,
        };
      }
      authService
        .login(body)
        .then(({ data }) => {
          const token = data.token_type + " " + data.access_token;
          setCookie("access_token", token);
          setUserData(data.user);
          push("/");
        })
        .catch((e) => {
          console.log("error bash verdi:", e);

          error(t("login.invalid"));
        })
        .finally(() => setSubmitting(false));
    },
    validate: (values: formValues) => {
      const errors: formValues = {} as formValues;
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

      console.log({ errors });

      return errors;
    },
  });

  const handleCopy = (login: string, password: string) => {
    formik.setValues({ login, password, keep_logged: true });
  };

  const toggleInput = () => {
    setIsPhoneInput(!isPhoneInput); // Telefon və email arasında keçid edir
    formik.resetForm(); // Input dəyişdikdə formu sıfırlayır
  };

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("login")}</h1>
        <p className={cls.text}>
          {t("dont.have.account")} <Link href="/register">{t("sign.up")}</Link>
        </p>
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
            error={!!formik.errors.email && formik.touched.email}
          />
        </>
      )}
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
            error={!!formik.errors.phone && formik.touched.phone}
            onChange={(value) => formik.setFieldValue("phone", value)}
          />
        </>
      )}

      <div className={cls.space} />
      <PasswordInput
        name="password"
        label={t("password")}
        placeholder={t("type.here")}
        value={formik.values.password}
        onChange={formik.handleChange}
        error={!!formik.errors.password && formik.touched.password}
      />
      <div className={cls.flex}>
        <div className={cls.item}>
          <CheckboxInput
            id="keep_logged"
            name="keep_logged"
            checked={formik.values.keep_logged}
            onChange={formik.handleChange}
          />
          <label htmlFor="keep_logged" className={cls.label}>
            {t("keep.logged")}
          </label>
        </div>
        <div className={cls.item}>
          <Link href="/reset-password">{t("forgot.password")}</Link>
        </div>
      </div>
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

        <PrimaryButton type="submit" loading={formik.isSubmitting}>
          {t("login")}
        </PrimaryButton>
      </div>
    </form>
  );
}
