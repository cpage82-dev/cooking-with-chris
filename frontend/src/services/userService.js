// frontend/src/services/userService.js
import api from "./api";

const getProfile = async () => {
  const res = await api.get("/users/profile/");
  return res.data;
};

const updateProfile = async (payload) => {
  const res = await api.put("/users/profile/", payload);
  return res.data;
};

const deleteAccount = async () => {
  const res = await api.delete("/users/profile/");
  return res.data; // usually undefined (204), that's fine
};

export default {
  getProfile,
  updateProfile,
  deleteAccount,
};
