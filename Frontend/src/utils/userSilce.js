import { createSlice } from "@reduxjs/toolkit";

// If no user Loggeg in
const defaultState = {
  token: null,
  name: null,
  username: null,
  email: null,
  _id: null,
  profilePic: null,
  followers: [],
  following: [],
};


let storedUser = {};
try {
  const userData = localStorage.getItem("user");
  storedUser = userData ? JSON.parse(userData) : {};
} catch (err) {
  console.error("Failed to parse user from localStorage:", err);
  storedUser = {};
}

// Merge with default state
const initialState = {
  ...defaultState,
  ...storedUser,
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    login(state, action) {
      const { user, token } = action.payload;

      const userData = {
        ...user,       // flatten user fields
        token,
        followers: user.followers || [],
        following: user.following || [],
      };

      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    },

    // for logout
    logout() {
      localStorage.removeItem("user");
      return { ...defaultState };
    },

    // for update
    updateData(state, action) {
      const data = action.payload;

      if (data[0] === "visibility") {
        const updated = { ...state, ...data[1] };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      }

      if (data[0] === "followers") {
        const updatedFollowing = state.following.includes(data[1])
          ? state.following.filter((id) => id !== data[1])
          : [...state.following, data[1]];

        const finalData = { ...state, following: updatedFollowing };
        localStorage.setItem("user", JSON.stringify(finalData));
        return finalData;
      }
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;
