import { createContext, useContext, useReducer } from "react";

import reducer from "./reducer";
import { RESET, UPDATE } from "./actions.js";
import { fetcher } from "../../utils/fetcher.js";
import { useQuery } from "@tanstack/react-query";

export const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {});
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const shopId = urlParams.get("shop_id");

  function updateSettings(data = {}) {
    dispatch({ type: UPDATE, payload: data });
  }

  function resetSettings() {
    dispatch({ type: RESET, payload: null });
  }

  useQuery(
    ["general-settings"],
    () => fetcher("v1/rest/settings").then((res) => res.json()),
    {
      onSuccess: (data) => {
        const settingsObj = createSettings(data.data);
        dispatch({
          type: UPDATE,
          payload: {
            split_max: Number(settingsObj.split_max) || 1,
            split_min: Number(settingsObj.split_min) || 1,
          },
        });
      },
    },
  );

  useQuery(
    ["shop-settings"],
    () => fetcher(`v1/rest/shops/${shopId}`).then((res) => res.json()),
    {
      onSuccess: (data) => {
        const order_payment = data?.data?.order_payment || "after";
        const shop_phone = data?.data?.phone;
        const wifi_data = {
          visible: Boolean(data.data?.wifi_name && data.data?.wifi_password),
          wifi_name: data.data?.wifi_name,
          wifi_password: data.data?.wifi_password,
        };
        dispatch({
          type: UPDATE,
          payload: {
            order_payment,
            wifi_data,
            shop_phone,
            new_order_after_payment: Boolean(
              data?.data?.new_order_after_payment,
            ),
          },
        });
      },
    },
  );

  return (
    <SettingsContext.Provider
      value={{
        settings: state,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function createSettings(list) {
  const result = list.map((item) => ({
    [item.key]: item.value,
  }));
  return Object.assign({}, ...result);
}
