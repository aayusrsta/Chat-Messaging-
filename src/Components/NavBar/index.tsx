// import React from "react";
// import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
// import { auth, db } from "../../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { useRouter } from "next/router";

// import { doc, updateDoc } from "firebase/firestore";

// interface NavBarProps {
//   selectedGroup: any;
//   getReceiverTokenForUser: Function;
// }

// const NavBar: React.FC<NavBarProps> = ({ selectedGroup, getReceiverTokenForUser }) => {
//   const [user] = useAuthState(auth);

//   const googleSignIn = () => {
//     const provider = new GoogleAuthProvider();
//     signInWithRedirect(auth, provider);
//   };

//   const logOut =async () => {
//     localStorage.removeItem('authToken');
//     signOut(auth).then(() => {
//     }).catch((error) => {
//     }); 
//     // if(auth.currentUser && auth.currentUser.uid){
//     // // await updateDoc(doc(db, "users", auth.currentUser.uid), {
//     // //   isOnline: false,
//     // // });
//     // await firebaseSignOut(auth);

//     //   }
//     if (auth.currentUser && auth.currentUser.uid) {
//       // Unsubscribe the current user from the topic
//       const currentUserToken = await getReceiverTokenForUser(auth.currentUser.uid);
//       if (currentUserToken) {
//         await unsubscribeFromTopic(currentUserToken, auth.currentUser.uid);
//       }
  
//       // Unsubscribe other members from the group topics (if it's a group chat)
//       if (selectedGroup) {
//         for (const memberId of selectedGroup.members) {
//           const memberToken = await getReceiverTokenForUser(memberId);
//           if (memberToken) {
//             await unsubscribeFromTopic(memberToken, selectedGroup.id);
//           }
//         }
//       }
//     }
  
//   };
//   const unsubscribeFromTopic = async (deviceToken: string, topic: string) => {
//     try {
//       const unsubscribeResponse = await fetch(
//         `https://iid.googleapis.com/iid/v1/${deviceToken}/rel/topics/${topic}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "key=YOUR_FIREBASE_SERVER_KEY",
//           },
//         }
//       );
  
//       if (!unsubscribeResponse.ok) {
//         console.error(
//           "Error unsubscribing member from topic:",
//           unsubscribeResponse.statusText
//         );
//       }
//     } catch (error) {
//       console.error("Error during fetch request:", error);
//     }
//   };

//   };
//   const router =useRouter();
//   const navigateRegister=()=>{
//     router.push('/register')
//   }

//   return (
//     <nav className="nav-bar">
//       <h1>Aayu's Messenger</h1>
//       {user ? (
//         <>
//         <p>Welcome {auth.currentUser?.displayName}</p>
//         {/* <p onClick={navigateRegister} style={{cursor:'pointer'}}>Register</p> */}

//         <button onClick={logOut} className="sign-out" type="button">
//           Log Out
//         </button>
//         </>
//       ) : (
//         <p onClick={navigateRegister} style={{cursor:'pointer'}}>Register</p>
//       )}
//     </nav>
//   );
// };

// export default NavBar;
// NavBar.tsx

import React from "react";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  signOut,
} from "firebase/auth";

interface NavBarProps {
  selectedGroup: any;
  getReceiverTokenForUser: Function;
}

const NavBar: React.FC<NavBarProps> = ({ selectedGroup, getReceiverTokenForUser }) => {
  const [user] = useAuthState(auth);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const logOut = async () => {
    localStorage.removeItem('authToken');

    if (auth.currentUser && auth.currentUser.uid) {
      const currentUserToken =  await getReceiverTokenForUser(auth.currentUser.uid);
      if (currentUserToken) {
        console.log("GOT THE CURRENT TOKEN",currentUserToken)
         await unsubscribeFromTopic(currentUserToken, auth.currentUser.uid);
         console.log("UNSUBSCRIBED")
      }

      if (selectedGroup) {
        for (const memberId of selectedGroup.members) {
          const memberToken =  getReceiverTokenForUser(memberId);
          if (memberToken) {
             unsubscribeFromTopic(memberToken, selectedGroup.id);
          }
        }
      }
    }
  };

  const unsubscribeFromTopic = async (deviceToken: string, topic: string) => {
    try {
      const unsubscribeResponse = await fetch(
        `https://iid.googleapis.com/iid/v1/${deviceToken}/rel/topics/${topic}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "key=AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD",
          },
        }
      );

      if (!unsubscribeResponse.ok) {
        console.error(
          "Error unsubscribing member from topic:",
          unsubscribeResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error during fetch request:", error);
    }
    signOut(auth).then(() => {}).catch((error) => {});

  };

  const router = useRouter();
  const navigateRegister = () => {
    router.push('/register');
  }

  return (
    <nav className="nav-bar">
      <h1>Aayu's Messenger</h1>
      {user ? (
        <>
          <p>Welcome {auth.currentUser?.displayName}</p>
          <button onClick={logOut} className="sign-out" type="button">
            Log Out
          </button>
        </>
      ) : (
        <p onClick={navigateRegister} style={{ cursor: 'pointer' }}>Register</p>
      )}
    </nav>
  );
};

export default NavBar;
