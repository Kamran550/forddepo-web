import React, { useState } from "react";
import InsertNewPhone from "./insertNewPhone";
import NewPhoneVerify from "./newPhoneVerify";

type Props = {
  handleClose: () => void;
};
type EditPhoneViews = "EDIT" | "VERIFY";

export default function EditPhone({ handleClose }: Props) {
  const [currentView, setCurrentView] = useState<EditPhoneViews>("EDIT");
  const [phone, setPhone] = useState("");
  const [verifyId, setVerifyId] = useState();

  const [callback, setCallback] = useState(undefined);
  const handleChangeView = (view: EditPhoneViews) => setCurrentView(view);
  const renderView = () => {
    switch (currentView) {
      case "EDIT":
        return (
          <InsertNewPhone
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
          <NewPhoneVerify
            phone={phone}
            callback={callback}
            verifyId={verifyId}
            setCallback={setCallback}
            handleClose={handleClose}
          />
        );
      default:
        return (
          <InsertNewPhone
            changeView={handleChangeView}
            onSuccess={({ phone, callback }) => {
              setPhone(phone);
              setCallback(callback);
            }}
          />
        );
    }
  };
  return <>{renderView()}</>;
}
