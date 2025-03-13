import React, { useEffect, useContext, useReducer } from "react";
import reducer from "./reducer";
import {
  ADD_TO_CART,
  REMOVE_CART_ITEM,
  TOGGLE_CART_ITEM_AMOUNT,
  CLEAR_CART,
  COUNT_CART_TOTALS,
  HIDE_ORDER_LINK,
} from "./actions";

const initialState = {
  cart: [],
  total_items: 0,
  total_amount: 0,
  total_price: 0,
  shipping_fee: 534,
  showOrderLink: false,
};

const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (product) => {
    dispatch({ type: ADD_TO_CART, payload: { product } });
  };

  const removeItem = (id, idx) => {
    dispatch({ type: REMOVE_CART_ITEM, payload: { id, idx } });
  };

  const toggleAmount = (id, value, idx) => {
    dispatch({ type: TOGGLE_CART_ITEM_AMOUNT, payload: { id, value, idx } });
  };

  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };

  const hideOrderLink = () => {
    dispatch({ type: HIDE_ORDER_LINK });
  };

  useEffect(() => {
    dispatch({ type: COUNT_CART_TOTALS });
  }, [state.cart]);

  // console.log('Next State=>', state)
  // console.groupEnd('cart_reducer');

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeItem,
        toggleAmount,
        clearCart,
        hideOrderLink,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCartContext = () => {
  return useContext(CartContext);
};
