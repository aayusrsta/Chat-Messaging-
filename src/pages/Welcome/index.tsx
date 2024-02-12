import React, { useState, ChangeEvent, FormEvent } from "react";

import {
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { updateDoc, doc, addDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Image from "next/image";
import useFcmToken from "@/utils/hooks/useFcmToken";

interface LoginProps {}

interface UserLogin {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

const Welcome: React.FC<LoginProps> = () => {
  const [data, setData] = useState<UserLogin>({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const router = useRouter();

  const { email, password, error, loading } = data;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCustomTokenSignIn = async (token: string | undefined) => {
    if (!token) {
      console.error("Custom token is undefined");
      setData({ ...data, error: "Custom token is undefined", loading: false });
      return;
    }

    const auth = getAuth();

    try {
      console.log("Custom Token:", token);

      const userCredential = await signInWithCustomToken(auth, token);

      const user = userCredential.user;
      const fcmToken = useFcmToken();
      console.log("AYOOO THEuser is", user);

      router.replace("/");
    } catch (error) {
      console.error("Error signing in with custom token:", error);
      setData({
        ...data,
        error: "Error signing in with custom token",
        loading: false,
      });
    }
  };

  const handleEmailPasswordSignIn = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      setData({
        email: "",
        password: "",
        error: null,
        loading: false,
      });
      router.replace("/");
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });

    if (!email || !password) {
      setData({ ...data, error: "All fields are required" });
      return;
    }

    try {
      const loginResponse = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password }),
        }
      );

      const loginData = await loginResponse.json();
      console.log(loginData);

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }

      const { access_token, refresh_token } = loginData;
      console.log("Received access_token:", access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", access_token);
      }
      const userResponse = await fetch("http://localhost:8000/api/auth/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();

      const customToken = userData?.customToken;

      if (!customToken) {
        throw new Error("User id not found in the response");
      }

      await handleCustomTokenSignIn(customToken);
    } catch (err: any) {
      setData({
        ...data,
        error: err.message || "Error signing in",
        loading: false,
      });
    }
  };

  return (
    <div className="welcome">
      <h3>Log into your Account</h3>
      <form className="loginCard" onSubmit={handleSubmit}>
        <div className="input_container">
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Email"
            onChange={handleChange}
          />
        </div>
        <div className="input_container">
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="btn_container">
          <button className="customButton" disabled={loading}>
            {loading ? "Logging in ..." : "Login"}
          </button>
        </div>
      </form>
      {/* <p>OR</p> */}
      {/* <button className="sign-in">
        <Image
          src="/images/google-signin.png"
          alt="Google Sign-In"
          width={100}
          height={50}
          onClick={googleSignIn}
        />
      </button> */}
    </div>
  );
};

export default Welcome;
