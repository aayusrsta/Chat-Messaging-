// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth, db } from "../../firebase";
// import { setDoc, doc, Timestamp } from "firebase/firestore";
// import { useRouter } from "next/router";

// interface RegisterProps {}

// interface UserData {
//   name: string;
//   email: string;
//   password: string;
//   error: string | null;
//   loading: boolean;
// }

// const Register: React.FC<RegisterProps> = () => {
//   const [data, setData] = useState<UserData>({
//     name: "",
//     email: "",
//     password: "",
//     error: null,
//     loading: false,
//   });

//   const router = useRouter();

//   const { name, email, password, error, loading } = data;

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setData({ ...data, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setData({ ...data, error: null, loading: true });
//     if (!name || !email || !password) {
//       setData({ ...data, error: "All fields are required" });
//     }
//     try {
//       const result = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       await updateProfile(result.user, { displayName: name });

//       await setDoc(doc(db, "users", result.user.uid), {
//         uid: result.user.uid,
//         name,
//         email,
//         createdAt: Timestamp.fromDate(new Date()),
//         isOnline: true,
//       });
//       setData({
//         name: "",
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
//     <section>
//       <h3>Create An Account</h3>
//       <form className="register-form" onSubmit={handleSubmit}>
//         <div className="input_container">
//           <label htmlFor="name">Name</label>
//           <input type="text" name="name" value={name} onChange={handleChange} />
//         </div>
//         <div className="input_container">
//           <label htmlFor="email">Email</label>
//           <input
//             type="text"
//             name="email"
//             value={email}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="input_container">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             name="password"
//             value={password}
//             onChange={handleChange}
//           />
//         </div>
//         {error ? <p className="error">{error}</p> : null}
//         <div className="btn_container">
//           <button className="btn" disabled={loading}>
//             {loading ? "Creating ..." : "Register"}
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// };

// export default Register;
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface RegisterProps {}

interface UserData {
  first_name: string;
  last_name: string;
  username: string;
  usergroup_id: number;
  email: string;
  password: string;
  passwordConfirm: string;
  error: string | null;
  loading: boolean;
}

const Register: React.FC<RegisterProps> = () => {
  const [data, setData] = useState<UserData>({
    first_name: "",
    last_name: "",
    username: "",
    usergroup_id: 0, // Default value as it's a number
    email: "",
    password: "",
    passwordConfirm: "", // Added field
    error: null,
    loading: false,
  });

  const router = useRouter();

  const { first_name, last_name, username, usergroup_id, email, password, passwordConfirm, error, loading } = data;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "usergroup_id" ? parseInt(e.target.value, 10) : e.target.value;
    setData({ ...data, [e.target.name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });

    if (!first_name || !last_name || !username || !usergroup_id || !email || !password || !passwordConfirm) {
      setData({ ...data, error: "All fields are required" });
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      console.log("THE LOCALSTORAGE TOKEN", authToken);
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        first_name,
        last_name,
        username,
        usergroup_id,
        email,
        password,
        passwordConfirm,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`, 
        },
      });

      console.log(response.data);

      setData({
        first_name: "",
        last_name: "",
        username: "",
        usergroup_id, 
        email: "",
        password: "",
        passwordConfirm: "", // Reset to default value
        error: null,
        loading: false,
      });

      router.replace("/"); // Redirect to a specific page after successful registration
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  return (
    <section>
      <h3>Create An Account</h3>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="input_container">
          <label htmlFor="first_name">First Name</label>
          <input type="text" name="first_name" value={first_name} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="last_name">Last Name</label>
          <input type="text" name="last_name" value={last_name} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="username">Username</label>
          <input type="text" name="username" value={username} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="usergroup_id">Usergroup ID</label>
          <input type="number" name="usergroup_id" value={usergroup_id} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="email">Email</label>
          <input type="text" name="email" value={email} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={password} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input type="password" name="passwordConfirm" value={passwordConfirm} onChange={handleChange} />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="btn_container">
          <button className="btn" disabled={loading} type="submit">
            {loading ? "Creating ..." : "Register"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Register;
