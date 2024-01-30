import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
// import { auth } from "../../firebase";
// import { useRouter } from 'next/router';

// import {} from "firebase/auth";
// import Image from "next/image";
// const Welcome: React.FC = () => {

//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const signIn = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push('/user-list');

//     } catch (error: any) {
//       console.error("Error signing in with email/password", error.message);
//     }
//   };

//   return (
//     <main className="welcome">
//       <h2>Chatbox by Aayu</h2>
//       <Image
//         src="/images/chat-app.png"
//         alt="ReactJs logo"
//         width={50}
//         height={50}
//         onClick={googleSignIn}
//       />{" "}
//       <p>Login to chat with with your friends.</p>
//       <form onSubmit={signIn}>
//         <div className="loginCard">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <br />
//           <br />
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <br />
//           <button type="submit" className="customButton">
//             Log In
//           </button>
//         </div>
//       </form>
//       <p>OR</p>
//       <button className="sign-in">
//         <Image
//           src="/images/google-signin.png"
//           alt="ReactJs logo"
//           width={100}
//           height={50}
//           onClick={googleSignIn}
//         />
//       </button>
//     </main>
//   );
// };

// export default Welcome;

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import Image from "next/image";
interface LoginProps {}

interface UserData {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

const Welcome: React.FC<LoginProps> = () => {
  const [data, setData] = useState<UserData>({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const router = useRouter();

  const { email, password, error, loading } = data;
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: "All fields are required" });
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      });
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

  return (
    <div className="welcome">
      <h3>Log into your Account</h3>
      <form className="loginCard" onSubmit={handleSubmit}>
        <div className="input_container">
          <input
            type="text"
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
      <p>OR</p>
      <button className="sign-in">
        <Image
          src="/images/google-signin.png"
          alt="ReactJs logo"
          width={100}
          height={50}
          onClick={googleSignIn}
        />
      </button>
    </div>
  );
};

export default Welcome;
