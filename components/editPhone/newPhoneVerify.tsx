import { error, success } from "components/alert/toast";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import OtpInput from "react-otp-input";
import cls from "./editPhone.module.scss";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useCountDown } from "hooks/useCountDown";
import { useSettings } from "contexts/settings/settings.context";
import { useAuth } from "contexts/auth/auth.context";
import profileService from "services/profile";
import dayjs from "dayjs";
import { selectCurrency } from "redux/slices/currency";
import { useAppSelector } from "hooks/useRedux";
import { useQueryClient } from "react-query";
import authService from "services/auth";
import WhatsappLineIcon from "remixicon-react/WhatsappLineIcon";

interface formValues {
  verifyId?: string;
  verifyCode?: string;
}
type Props = {
  phone: string;
  callback?: any;
  verifyId?: string;
  setCallback?: (data: any) => void;
  handleClose: () => void;
};

export default function NewPhoneVerify({
  phone,
  callback,
  verifyId,
  setCallback,
  handleClose,
}: Props) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const waitTime = settings.otp_expire_time * 60 || 60;
  const [time, timerStart, _, timerReset] = useCountDown(waitTime);
  const [currentVerifyId, setCurrentVerifyId] = useState(verifyId);

  const { phoneNumberSignIn, setUserData, user } = useAuth();
  const currency = useAppSelector(selectCurrency);
  const queryClient = useQueryClient();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "false";

  const isAzerbaijanNumber = (phone: string) => {
    return phone.startsWith("+994");
  };

  const formik = useFormik({
    initialValues: {},
    onSubmit: (values: formValues, { setSubmitting }) => {
      console.log({ values });

      const payload = {
        firstname: user.firstname,
        lastname: user.lastname,
        birthday: dayjs(user.birthday).format("YYYY-MM-DD"),
        gender: user.gender,
        phone: parseInt(phone),
      };
      console.log("Confirming OTP...", verifyId);

      // authService
      //   .verifyPhone2({
      //     verifyCode: values.verifyId,
      //     verifyId,
      //   })
      //   .then(() => {
      //     console.log("OTP confirmed");
      //     profileService
      //       .updatePhone(payload)
      //       .then((res) => {
      //         setUserData(res.data);
      //         success(t("verified"));
      //         handleClose();
      //         queryClient.invalidateQueries(["profile", currency?.id]);
      //       })
      //       .catch((err) => {
      //         console.log("error occured");

      //         if (err?.data?.params?.phone) {
      //           error(err?.data?.params?.phone.at(0));
      //           return;
      //         }
      //         error(t("some.thing.went.wrong"));
      //       })
      //       .finally(() => setSubmitting(false));
      //   })
      //   .catch((err) => {
      //     console.log("error 2 occured", err);

      //     error(t("verify.error"));
      //     setSubmitting(false);
      //   });

      if (isAzerbaijanNumber(phone)) {
        console.log("Azerbaijan");

        console.log({ currentVerifyId });

        authService
          .verifyPhone2({
            verifyCode: values.verifyId,
            verifyId: currentVerifyId,
          })
          .then(() => {
            console.log("OTP confirmed");
            profileService
              .updatePhone(payload)
              .then((res) => {
                setUserData(res.data);
                success(t("verified"));
                handleClose();
                queryClient.invalidateQueries(["profile", currency?.id]);
              })
              .catch((err) => {
                console.log("error occured");

                if (err?.data?.params?.phone) {
                  error(err?.data?.params?.phone.at(0));
                  return;
                }
                error(t("some.thing.went.wrong"));
              })
              .finally(() => setSubmitting(false));
          })
          .catch((err) => {
            console.log("error 2 occured", err);

            error(t("verify.error"));
            setSubmitting(false);
          });
      } else {
        console.log("Foreign number");

        callback
          .confirm(values.verifyId || "")
          .then(() => {
            console.log("OTP confirmed");

            profileService
              .updatePhone(payload)
              .then((res) => {
                setUserData(res.data);
                success(t("verified"));
                handleClose();
                queryClient.invalidateQueries(["profile", currency?.id]);
              })
              .catch((err) => {
                console.log("error occured");

                if (err?.data?.params?.phone) {
                  error(err?.data?.params?.phone.at(0));
                  return;
                }
                error(t("some.thing.went.wrong"));
              })
              .finally(() => setSubmitting(false));
          })
          .catch(() => {
            console.log("error 2 occured");

            error(t("verify.error"));
          });
      }
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.verifyId) {
        errors.verifyId = t("required");
      }
      return errors;
    },
  });

  const handleResendCode = () => {
    if (isAzerbaijanNumber(phone)) {
      console.log("resend Azerbaijan");

      authService.resendPhone({ phone }).then((confirmationResult) => {
        timerReset();
        timerStart();
        success(t("verify.send"));
        console.log({ confirmationResult });

        const newVerifyId = confirmationResult?.data?.verifyId;
        setCurrentVerifyId(newVerifyId);

        formik.setValues({ verifyId: "" });

        if (setCallback) setCallback(confirmationResult);
      });
    } else {
      console.log("resend foreign else");

      phoneNumberSignIn(phone)
        .then((confirmationResult) => {
          timerReset();
          timerStart();
          success(t("verify.send"));
          if (setCallback) setCallback(confirmationResult);
        })
        .catch(() => error(t("sms.not.sent")));
    }
  };

  const handleResendCodeWithWhatsapp = () => {
    authService
      .resendWhatsapp({ phone })
      .then((confirmationResult) => {
        timerReset();
        timerStart();
        success(t("verify.send"));
        const newVerifyId = confirmationResult?.data?.verifyId;
        setCurrentVerifyId(newVerifyId);

        formik.setValues({ verifyId: "" });

        if (setCallback) setCallback(confirmationResult);
      })
      .catch(() => error(t("sms.not.sent")));
  };

  useEffect(() => {
    timerStart();
  }, []);

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("verify.phone")}</h1>
        <p>verify et</p>
        <p className={cls.text}>
          {t("verify.text")} <i>{phone}</i>
        </p>
      </div>
      <div className={cls.space} />
      <Stack spacing={2}>
        <OtpInput
          numInputs={6}
          inputStyle={cls.input}
          isInputNum
          containerStyle={cls.otpContainer}
          value={formik.values.verifyId?.toString()}
          onChange={(otp: any) => formik.setFieldValue("verifyId", otp)}
        />
        {/* <p className={cls.text}>
          {t("verify.didntRecieveCode")}{" "}
          {time === 0 ? (
            <>
              <span
                id="sign-in-button"
                onClick={handleResendCode}
                className={cls.resend}
              >
                {t("resend")}
              </span>
              {" | "}
              <span
                id="sign-in-button"
                onClick={handleResendCodeWithWhatsapp}
                className={cls.resend}
              >
                {t("resend.with.Whatsapp")}
              </span>
            </>
          ) : (
            <span className={cls.text}>{time} s</span>
          )}
        </p> */}
        <div className={cls.space} />

        {time === 0 ? (
          <div className={cls.resendContainer}>
            <button onClick={handleResendCode} className={cls.resendButton}>
              📩 {t("resend")} {/* SMS ilə göndər */}
            </button>

            <button
              onClick={handleResendCodeWithWhatsapp}
              className={`${cls.resendButton} ${cls.whatsappButton}`}
            >
              <WhatsappLineIcon /> {t("resend.with.Whatsapp")}
            </button>
          </div>
        ) : (
          <p className={cls.text}>
            {t("verify.pleaseWait")} {time} s
          </p>
        )}
      </Stack>
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          type="submit"
          disabled={Number(formik?.values?.verifyId?.toString()?.length) < 6}
          loading={formik.isSubmitting}
        >
          {t("verify")}
        </PrimaryButton>
      </div>
    </form>
  );
}
