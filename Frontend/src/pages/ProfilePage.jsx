import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateData } from "../utils/userSilce";
import { useState } from "react";
import { Spinner } from "../components/Common/Spinner";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user.bio || "");

  const handleSaveBio = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/profile/update-bio`,
        { bio: bioText },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      dispatch(updateData(["visibility", { ...user, bio: bioText }]));
      setEditingBio(false);
    } catch (error) {
      console.error("Failed to update bio:", error);
      alert("Could not update bio.");
    }
  };

  if (!user || !user._id) return <Spinner message="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 bg-white px-6 py-10 text-black dark:text-white transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-white/5 backdrop-blur-xl shadow-2xl border border-gray-200 dark:border-white/10 rounded-3xl px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          {/* Profile Image */}
          <div className="w-48 h-48 lg:w-56 lg:h-56 flex-shrink-0">
            <div className="relative group w-full h-full">
              <img
                src={
                  user?.profilePic ||
                  "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg"
                }
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover border-4 border-gray-200 dark:border-white/10 transition duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-indigo-600 px-2 py-1 text-xs rounded-full text-white">
                Pro
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">@{user.username}</p>

            {/* Bio */}
            {!editingBio ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {user.bio || "No bio added."}
                </p>
                <button
                  onClick={() => setEditingBio(true)}
                  className="text-indigo-500 hover:underline text-sm"
                >
                  {user.bio ? "Edit Bio" : "Add Bio"}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="w-full p-2 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white resize-none"
                />
                <div className="flex gap-2 justify-center lg:justify-start">
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBioText(user.bio || "");
                    }}
                    className="px-4 py-1 bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-8 mt-4 justify-center lg:justify-start">
              <div>
                <p className="text-xl font-semibold">
                  {user.followers?.length ?? 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {user.following?.length ?? 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
