// import React, { useState, ChangeEvent, FormEvent } from "react";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithRedirect,
// } from "firebase/auth";
// import { auth, db } from "../../firebase";
// import { updateDoc, doc } from "firebase/firestore";
// import { useRouter } from "next/router";
// import Image from "next/image";
// interface LoginProps {}

// interface UserData {
//   email: string;
//   password: string;
//   error: string | null;
//   loading: boolean;
// }

// const Welcome: React.FC<LoginProps> = () => {
//   const [data, setData] = useState<UserData>({
//     email: "",
//     password: "",
//     error: null,
//     loading: false,
//   });

//   const router = useRouter();

//   const { email, password, error, loading } = data;
//   const googleSignIn = () => {
//     const provider = new GoogleAuthProvider();
//     signInWithRedirect(auth, provider);
//   };
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setData({ ...data, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setData({ ...data, error: null, loading: true });
//     if (!email || !password) {
//       setData({ ...data, error: "All fields are required" });
//     }
//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password);

//       await updateDoc(doc(db, "users", result.user.uid), {
//         isOnline: true,
//       });
//       setData({
//         email: "",
//         password: "",
//         error: null,
//         loading: false,
//       });
//       router.replace("/");
//     } catch (err: any) {
//       setData({ ...data, error: err.message, loading: false });
//     }
//   };

//   return (
//     <div className="welcome">
//       <h3>Log into your Account</h3>
//       <form className="loginCard" onSubmit={handleSubmit}>
//         <div className="input_container">
//           <input
//             type="text"
//             name="email"
//             value={email}
//             placeholder="Email"
//             onChange={handleChange}
//           />
//         </div>
//         <div className="input_container">
//           <input
//             type="password"
//             name="password"
//             value={password}
//             placeholder="Password"
//             onChange={handleChange}
//           />
//         </div>
//         {error ? <p className="error">{error}</p> : null}
//         <div className="btn_container">
//           <button className="customButton" disabled={loading}>
//             {loading ? "Logging in ..." : "Login"}
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
//     </div>
//   );
// };

// export default Welcome;

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  getAuth,
  signInWithCustomToken,
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
      console.log("Received custom token:", token);

      const userCredential = await signInWithCustomToken(auth, token);

      const user = userCredential.user;
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

      // await updateDoc(doc(db, "users", result.user.uid), {
      //   isOnline: true,
      // });
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
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        await handleEmailPasswordSignIn();
        return;
      }

      const { token, customToken } = await response.json();

      console.log("Received custom token from server:", customToken);
      if (response.ok) {
        await handleCustomTokenSignIn(customToken);
      }
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
