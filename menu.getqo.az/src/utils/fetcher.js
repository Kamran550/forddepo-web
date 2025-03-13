import { BASE_URL } from "../config/site-settings";

export const fetcher = (url, options) => {
  const params = new URLSearchParams(options);
  return fetch(`${BASE_URL}${url}${options ? `?${params.toString()}` : ""}`, {
    headers: {
      Application: "application/json",
    },
  });
};
