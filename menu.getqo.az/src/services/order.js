import { BASE_URL } from "../config/site-settings";

export const createOrderRequest = async (data) => {
  const res = await fetch(`${BASE_URL}v1/rest/orders`, {
    headers: { "Content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.status === 200) {
    return res.json();
  }
  if (res.status === 400) {
    const errorRes = await res.json();
    throw errorRes.params ?? { error: errorRes.message };
  }
  throw Error;
};

export const deleteProductFromOrder = async (data) => {
  const res = await fetch(`${BASE_URL}v1/rest/order-details/delete`, {
    headers: { "Content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.status === 200) {
    return res.json();
  }
  throw Error;
};

export const updateOrderRequest = async (id, data) => {
  const res = await fetch(`${BASE_URL}v1/rest/orders/update-tips/${id}`, {
    headers: { "Content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.status === 200) {
    return res.json();
  }
  throw Error;
};
