import API from "./api";

export const loginAPI = (data) =>
  API.post("/auth/login", data);

export const registerAPI = (data) =>
  API.post("/auth/register", data);

export const checkEmailExists = async (email) => {
  const res = await API.post("/auth/check-email", { email });
  return res.data;
};

export const mergeGuestDataAPI = (email) =>
  API.post("/auth/merge-guest-data", { email });
