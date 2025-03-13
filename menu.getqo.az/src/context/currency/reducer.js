export const CURRENCY_ACTIONS = {
  SET_CURRENCY: "SET_CURRENCY",
  SET_DEFAULT_CURRENCY: "SET_DEFAULT_CURRENCY",
};

const currencyReducer = (state, action) => {
  if (action.type === CURRENCY_ACTIONS.SET_CURRENCY) {
    return {
      ...state,
      currency: action.payload,
    };
  } else if (action.type === CURRENCY_ACTIONS.SET_DEFAULT_CURRENCY) {
    return {
      defaultCurrency: action.payload,
    };
  }
};

export default currencyReducer;
