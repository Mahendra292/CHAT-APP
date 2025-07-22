import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useContext(AuthContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === 'Sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    let success = false;

    if (currState === "Sign up") {
      success = await signup(fullName, email, password, bio);
    } else {
      success = await login(email, password);
    }

    if (success) {
      if (currState === "Sign up") {
        toast.success("Account created successfully!");
      } else {
        toast.success("Logged in successfully!");
      }
      navigate("/");
    } else {
      toast.error("Authentication failed. Please check your details.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-cover bg-center relative flex justify-center items-center px-6" style={{ backgroundImage: "url('./src/assets/bgImage.svg')" }}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-0" />
      <div className="flex justify-between items-center w-full max-w-[1000px] z-10 max-sm:flex-col max-sm:justify-center max-sm:gap-12">
        <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)]" />
        <form
          onSubmit={onSubmitHandler}
          className="w-[320px] border-2 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg bg-white/5 backdrop-blur-md"
        >
          <h2 className="font-medium text-2xl flex justify-between items-center">
            {currState}
            {isDataSubmitted && (
              <img
                onClick={() => setIsDataSubmitted(false)}
                src={assets.arrow_icon}
                alt="Back"
                className="w-5 cursor-pointer"
              />
            )}
          </h2>

          {!isDataSubmitted && (
            <>
              {currState === "Sign up" && (
                <input
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  type="text"
                  className="p-2 border border-gray-500 rounded-md focus:outline-none"
                  placeholder="Full Name"
                  required
                />
              )}
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Address"
                required
                className="p-2 border border-gray-500 rounded-md focus:outline-none"
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                className="p-2 border border-gray-500 rounded-md focus:outline-none"
              />
            </>
          )}

          {currState === "Sign up" && isDataSubmitted && (
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              placeholder="Provide a short bio"
            />
          )}

          <button
            type="submit"
            className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
          >
            {currState === "Sign up" ? "Create Account" : "Login Now"}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>

          <div className="flex flex-col gap-2">
            {currState === "Sign up" ? (
              <p className="text-sm text-gray-300">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setCurrState("login");
                    setIsDataSubmitted(false);
                  }}
                  className="font-medium text-violet-400 cursor-pointer"
                >
                  Login here
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-300">
                Create an account{" "}
                <span
                  onClick={() => setCurrState("Sign up")}
                  className="font-medium text-violet-400 cursor-pointer"
                >
                  click here
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
