import cart from "./slices/cart";
import currency from "./slices/currency";
import favoriteRestaurants from "./slices/favoriteRestaurants";
import shopFilter from "./slices/shopFilter";
import userCart from "./slices/userCart";
import product from "./slices/product";
import chat from "./slices/chat";
import search from "./slices/search";
import order from "./slices/order";
import modal from "./slices/modal"; // Əlavə et

const rootReducer = {
  liked: favoriteRestaurants,
  cart: cart,
  filter: shopFilter,
  currency: currency,
  userCart: userCart,
  product: product,
  chat: chat,
  search: search,
  order: order,
  modal: modal,
};

export default rootReducer;
