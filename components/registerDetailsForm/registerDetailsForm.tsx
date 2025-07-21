import React, { useState } from "react";
import cls from "./registerDetailsForm.module.scss";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import PasswordInput from "components/inputs/passwordInput";
import { useAuth } from "contexts/auth/auth.context";
import { useRouter } from "next/router";
import { error } from "components/alert/toast";
import authService from "services/auth";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { setCookie } from "utils/session";
import { RegisterCredentials } from "interfaces/user.interface";
import { showFreeDeliveryModal } from "redux/slices/modal";
import { useDispatch } from "react-redux";
import InfoIcon from "@mui/icons-material/Info";

type Props = {
  phone?: string;
};

interface formValues {
  email?: string;
  phone?: string;
  firstname: string;
  lastname: string;
  password: string;
  password_confirmation: string;
  referral?: string;
  gender: string;
  type?: string;
}

export default function RegisterDetailsForm({ phone }: Props) {
  const { t } = useTranslation();
  const { push, query } = useRouter();
  const { setUserData } = useAuth();
  const referralCode: any = query.referral_code;
  const dispatch = useDispatch();

  console.log({ phone });

  const formik = useFormik({
    initialValues: {
      email: "",
      phone,
      gender: "male",
      firstname: "",
      lastname: "",
      password: "",
      password_confirmation: "",
      referral: referralCode,
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      console.log({ values });

      const body: RegisterCredentials = {
        ...values,
        referral: values.referral || undefined,
      };
      if (values.email?.includes("@")) {
        authService
          .registerComplete(body)
          .then(({ data }) => {
            const token = "Bearer" + " " + data.token;
            setCookie("access_token", token);
            setUserData(data.user);
            console.log("data useri:", data.user);

            const freeDelivery = data?.user?.free_delivery;
            console.log({ freeDelivery });

            if (freeDelivery) {
              console.log("dispatch ise dusdu");

              dispatch(
                showFreeDeliveryModal({
                  count: freeDelivery.count,
                  date: freeDelivery.date,
                }),
              );

              setTimeout(() => {
                push("/");
              }, 100);
            }
            push("/");
          })
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
          .finally(() => setSubmitting(false));
      }
    },
    validate: (values: formValues) => {
      const errors: formValues = {} as formValues;
      if (!values.firstname) {
        errors.firstname = t("required");
      }
      if (!values.lastname) {
        errors.lastname = t("required");
      }
      if (!values.email) {
        errors.email = t("required");
      }
      if (!values.password) {
        errors.password = t("required");
      }
      if (!values.password_confirmation) {
        errors.password_confirmation = t("required");
      }
      if (values.password !== values.password_confirmation) {
        errors.password_confirmation = t("should.match");
      }
      return errors;
    },

    initialErrors: {},
    validateOnBlur: false,
    validateOnChange: false,
    validateOnMount: false,
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("sign.up")}</h1>
      </div>
      <div className={cls.space} />
      <div className={cls.flex}>
        <div className={cls.item}>
          <TextInput
            name="firstname"
            label={t("firstname")}
            placeholder={t("type.here")}
            value={formik.values.firstname}
            onChange={formik.handleChange}
            error={!!formik.errors.firstname}
            helperText={formik.errors.firstname}
          />
        </div>
        <div className={cls.item}>
          <TextInput
            name="lastname"
            label={t("lastname")}
            placeholder={t("type.here")}
            value={formik.values.lastname}
            onChange={formik.handleChange}
            error={!!formik.errors.lastname}
            helperText={formik.errors.lastname}
          />
        </div>
      </div>
      <div className={cls.space} />
      <div className={cls.flex}>
        <div className={cls.item}>
          <TextInput
            name="email"
            label={t("email")}
            placeholder={t("type.here")}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={!!formik.errors.email}
            helperText={formik.errors.email}
          />
        </div>
        <div className={cls.item}>
          <FormLabel
            sx={{
              fontSize: "9px",
              color: "var(--black)",
              textTransform: "uppercase",
            }}
            id="demo-radio-buttons-group-label"
          >
            {t("gender")}
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            row
            value={formik.values.gender}
            onChange={(e) => formik.setFieldValue("gender", e.target.value)}
          >
            <FormControlLabel
              value="male"
              control={<Radio />}
              label={t("male")}
            />
            <FormControlLabel
              value="female"
              control={<Radio />}
              label={t("female")}
            />
          </RadioGroup>
        </div>
      </div>
      <div className={cls.space} />

      {/* <TextInput
        name="referral"
        label={t("referral")}
        placeholder={t("type.here")}
        value={formik.values.referral}
        onChange={formik.handleChange}
        error={!!formik.errors.referral}
        helperText={formik.errors.referral}
        autoComplete="off"
      /> */}
      <div className={cls.space} />
      <PasswordInput
        name="password"
        label={t("password")}
        placeholder={t("type.here")}
        value={formik.values.password}
        onChange={formik.handleChange}
        error={!!formik.errors.password}
        helperText={formik.errors.password}
      />
      <div className={cls.space} />
      <PasswordInput
        name="password_confirmation"
        label={t("password.confirmation")}
        placeholder={t("type.here")}
        value={formik.values.password_confirmation}
        onChange={formik.handleChange}
        error={!!formik.errors.password_confirmation}
        helperText={formik.errors.password_confirmation}
      />
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton type="submit" loading={formik.isSubmitting}>
          {t("sign.up")}
        </PrimaryButton>
      </div>
    </form>
  );
}
