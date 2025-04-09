import React, { useState } from "react";
import SEO from "components/seo";
import AuthContainer from "containers/auth/auth";
import RegisterForm from "components/registerForm/registerForm";
import RegisterDetailsForm from "components/registerDetailsForm/registerDetailsForm";
import OTPVerify from "components/otp-verify/otpVerify";
import SocialLogin from "components/socialLogin/socialLogin";

type Props = {};
type RegisterViews = "REGISTER" | "VERIFY" | "COMPLETE";

export default function Register({}: Props) {
  const [currentView, setCurrentView] = useState<RegisterViews>("REGISTER");
  const [verifyId, setVerifyId] = useState();
  const [phone, setPhone] = useState("");
  const [callback, setCallback] = useState(undefined);
  const handleChangeView = (view: RegisterViews) => setCurrentView(view);
  const renderView = () => {
    switch (currentView) {
      case "REGISTER":
        return (
          <RegisterForm
            changeView={handleChangeView}
            onSuccess={({ phone, callback, verifyId }) => {
              setPhone(phone);
              setCallback(callback);
              setVerifyId(verifyId);
            }}
          />
        );
      case "VERIFY":
        return (
          <OTPVerify
            changeView={handleChangeView}
            email={phone}
            callback={callback}
            setCallback={setCallback}
            verifyId={verifyId}
            onSuccess={({ phone, callback, verifyId }) => {
              setPhone(phone);
              setCallback(callback);
              setVerifyId(verifyId);
            }}
          />
        );
      case "COMPLETE":
        return <RegisterDetailsForm phone={phone} />;
      default:
        return (
          <RegisterForm
            changeView={handleChangeView}
            onSuccess={({ id }) => setVerifyId(id)}
          />
        );
    }
  };
  return (
    <>
      <SEO />
      <AuthContainer>
        {renderView()}
        <SocialLogin />
      </AuthContainer>
    </>
  );
}
