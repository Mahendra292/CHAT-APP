import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets'; // adjust if your avatar/logo icons are in a different path
import { AuthContext } from '../../context/AuthContext'; // ✅ adjust if context is in a different relative location

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const navigate = useNavigate();

  // Set initial form values based on current user
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || '');
      setBio(authUser.bio || '');
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio,
      });
      navigate('/');
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center" style={{
        backgroundImage: "url('./src/assets/bgImage.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg">Profile details</h3>

          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="Profile"
              className={`w-12 h-12 object-cover ${selectedImg || authUser?.profilePic ? 'rounded-full' : ''}`}
            />
            Upload profile image
          </label>

          <input
            type="text"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            placeholder="Write profile bio"
            required
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        <img
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`}
          src={authUser?.profilePic ||assets.logo_icon}
          alt="App Logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
