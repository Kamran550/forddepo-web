import {
  ADD_TO_CART,
  CLEAR_CART,
  COUNT_CART_TOTALS,
  REMOVE_CART_ITEM,
  TOGGLE_CART_ITEM_AMOUNT,
  HIDE_ORDER_LINK,
} from "./actions";

const cart_reducer = (state, action) => {
  // console.group("cart_reducer");
  // console.log("PREV_STATE =>", state);
  // console.log("ACTION =>", action);
  try {
    if (action.type === ADD_TO_CART) {
      const { product } = action.payload;
      const tempItem = state.cart.find(
        (i) => i.stock.id === product.stock.id && i.addons.length === 0,
      );
      const tempItemIdx = state.cart.findIndex(
        (i) => i.stock.id === product.stock.id && i.addons.length === 0,
      );

      if (
        tempItem &&
        tempItem.addons.length === 0 &&
        product.addons.length === 0
      ) {
        const tempCart = state.cart.map((cartItem, idx) => {
          if (cartItem.stock.id === product.stock.id && tempItemIdx === idx) {
            let newAmount = cartItem.stock.amount + product.stock.amount;
            if (newAmount > cartItem.max_qty) {
              newAmount = cartItem.max_qty;
            }
            return {
              ...cartItem,
              stock: { ...cartItem.stock, amount: newAmount },
            };
          } else {
            return cartItem;
          }
        });
        return { ...state, cart: tempCart };
      }

      // if (tempItem) {
      //   const tempCart = state.cart.map((cartItem) => {
      //     if (cartItem.stock.id === product.stock.id) {
      //       let newAmount = cartItem.stock.amount + product.min_qty;
      //       if (newAmount > cartItem.max_qty) {
      //         newAmount = cartItem.max_qty;
      //       }
      //       return {
      //         ...cartItem,
      //         stock: { ...cartItem.stock, amount: newAmount },
      //       };
      //     } else {
      //       return cartItem;
      //     }
      //   });
      //
      //   return { ...state, cart: tempCart };
      // } else {
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            ...product,
            stock: {
              ...product.stock,
              amount: product.stock.amount || product.min_qty || 1,
            },
          },
        ],
      };
      // }
    }
    if (action.type === REMOVE_CART_ITEM) {
      const actionIdx =
        action.payload.idx ??
        state.cart.findLastIndex((item) => item.stock.id === action.payload.id);

      const tempCart = state.cart.filter((item, idx) => {
        return idx !== actionIdx;
      });
      return { ...state, cart: tempCart };
    }

    if (action.type === CLEAR_CART) {
      return { ...state, cart: [], showOrderLink: true };
    }

    if (action.type === HIDE_ORDER_LINK) {
      return { ...state, showOrderLink: false };
    }

    if (action.type === TOGGLE_CART_ITEM_AMOUNT) {
      const { id, value, idx } = action.payload;
      const actionIdx =
        idx ?? state.cart.findLastIndex((item) => item.stock.id === id);
      const tempCart = state.cart
        .map((item, index) => {
          if (item.stock.id === id && index === actionIdx) {
            if (value === "inc") {
              let newAmount = item.stock.amount + 1;
              if (newAmount > (item.max_qty ?? Infinity))
                newAmount = item.max_qty ?? newAmount;
              return { ...item, stock: { ...item.stock, amount: newAmount } };
            }
            if (value === "dec") {
              let newAmount = item.stock.amount - 1;
              if (newAmount < (item.min_qty ?? 1)) return undefined;
              return { ...item, stock: { ...item.stock, amount: newAmount } };
            }
          } else {
            return item;
          }
        })
        .filter(Boolean);
      return { ...state, cart: tempCart };
    }

    if (action.type === COUNT_CART_TOTALS) {
      const { total_items, total_amount, total_price, total_tax } =
        state.cart.reduce(
          (total, item) => {
            const { stock } = item;
            const addonsTotal =
              item.addons?.reduce(
                (acc, addon) => acc + addon.stock.total_price * addon.quantity,
                0,
              ) ?? 0;
            total.total_items += stock.amount;
            total.total_amount +=
              stock.total_price * stock.amount + addonsTotal;
            total.total_price += stock.price * stock.amount + addonsTotal;
            total.total_tax += stock.tax * stock.amount;

            return total;
          },
          { total_items: 0, total_amount: 0, total_price: 0, total_tax: 0 },
        );
      return { ...state, total_items, total_amount, total_price, total_tax };
    }
    throw new Error(`No Matching "${action.type}" - action type`);
  } catch (error) {
    console.error("ERROR =>", error);
  }
};

export default cart_reducer;
