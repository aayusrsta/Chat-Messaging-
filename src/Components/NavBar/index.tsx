import React from "react";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  signOut,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

const NavBar: React.FC = () => {
  const [user] = useAuthState(auth);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const logOut =async () => {
    localStorage.removeItem('authToken');
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    }); 
    if(auth.currentUser && auth.currentUser.uid){
    // await updateDoc(doc(db, "users", auth.currentUser.uid), {
    //   isOnline: false,
    // });
    await firebaseSignOut(auth);

      }
         

  };
  const router =useRouter();
  const navigateRegister=()=>{
    router.push('/register')
  }

  return (
    <nav className="nav-bar">
      <h1>Aayu's Messenger</h1>
      {user ? (
        <>
        <p>Welcome {auth.currentUser?.displayName}</p>
        <p onClick={navigateRegister} style={{cursor:'pointer'}}>Register</p>

        <button onClick={logOut} className="sign-out" type="button">
          Log Out
        </button>
        </>
      ) : (
        <p onClick={navigateRegister} style={{cursor:'pointer'}}>Register</p>
      )}
    </nav>
  );
};

export default NavBar;
