import { createSlice } from "@reduxjs/toolkit";

// If no user Loggeg in
const defaultState = {
  token: null,
  userId: null,
  name: null,
  username: null,
  email: null,
  profilePic: null,
  followers: [],
  following: [],
  bio: "",
};

// Load from localStorage
let storedUser = {};
try {
  const userData = localStorage.getItem("user");
  storedUser = userData ? JSON.parse(userData) : {};
} catch (err) {
  console.error("Failed to parse user from localStorage:", err);
  storedUser = {};
}

const initialState = {
  ...defaultState,
  ...storedUser,
  followers: storedUser.followers || [],
  following: storedUser.following || [],
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    login(state, action) {
      const { user, token } = action.payload;
      const { _id, ...rest } = user;

      const userData = {
        token,
        userId: _id,
        ...rest,
        followers: user.followers || [],
        following: user.following || [],
      };

      localStorage.setItem("user", JSON.stringify(userData));
      Object.assign(state, userData);
    },

    logout() {
      localStorage.removeItem("user");
      return { ...defaultState };
    },

    updateData(state, action) {
      const data = action.payload;

      if (data[0] === "visibility") {
        Object.assign(state, data[1]);
        localStorage.setItem("user", JSON.stringify(state));
      }

      if (data[0] === "followers") {
        const updatedFollowing = state.following.includes(data[1])
          ? state.following.filter((id) => id !== data[1])
          : [...state.following, data[1]];

        state.following = updatedFollowing;
        localStorage.setItem("user", JSON.stringify(state));
      }
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;
