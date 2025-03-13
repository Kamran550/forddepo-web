import { BASE_URL } from "../config/site-settings";

export const callRequest = async ({ table_id }) => {
  const res = await fetch(`${BASE_URL}v1/rest/orders/call/waiter/${table_id}`);
  if (res.status === 200) {
    return res.json();
  }
  throw Error;
};
