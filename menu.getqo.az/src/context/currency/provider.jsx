import React, { useContext } from "react";
import reducer from "./reducer.js";
import { CURRENCY_ACTIONS } from "./reducer.js";

const initialState = {
  currency: [],
  defaultCurrency: {},
};

const CurrencyContext = React.createContext();

export const CurrencyProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const setCurrency = (currency) => {
    dispatch({ type: CURRENCY_ACTIONS.SET_CURRENCY, payload: currency });
  };

  const setDefaultCurrency = (currency) => {
    dispatch({
      type: CURRENCY_ACTIONS.SET_DEFAULT_CURRENCY,
      payload: currency,
    });
  };

  return (
    <CurrencyContext.Provider
      value={{ ...state, setCurrency, setDefaultCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  return useContext(CurrencyContext);
};
