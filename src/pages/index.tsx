
import type { AppProps } from "next/app";
import { useEffect } from "react";
import app, { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import NavBar from "../Components/NavBar";
import Welcome from "./Welcome";
import Home from "./Home";
import { getToken, getMessaging, onMessage } from "@firebase/messaging";
import useFcmToken from "@/utils/hooks/useFcmToken";

function App({ Component, pageProps }: AppProps) {
  const [user] = useAuthState(auth);
  const { fcmToken,notificationPermissionStatus } = useFcmToken();
  fcmToken && console.log('FCM token:', fcmToken);


  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground push notification received:', payload);
        
      });
      return () => {
        unsubscribe(); 
      };
    }
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // if (user) {
    //   const messaging = getMessaging();
    //   getToken(messaging, { vapidKey: 'BCVDQWcX1Jbic82j_hOpHbasdrcHywqnKwWL7xDxYsMPbhmYGillMguXKy8yMSwcoC3zwMcxPyUPsYkoKGK7kAg' })
    //     .then((currentToken) => {
    //       if (currentToken) {
    //         console.log("The token is:", currentToken);
    //       } else {
    //         console.log("No registration token available. Request permission to generate one.");
    //       }
    //     })
    //     .catch((err) => {
    //       console.log("An error occurred while retrieving token. ", err);
    //     });
    // }
  }, []);

  return (
    <div className="App">
      <NavBar />
      {!user ? (
        <Welcome />
      ) : (
        <>
          <Home />
        </>
      )}
    </div>
  );
}

export default App;
// import { useState } from 'react';

// export default function Home() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = async (e:any) => {
//     e.preventDefault();

//     // Send a POST request to the authentication server
//     const response = await fetch('http://localhost:3001/api/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await response.json();

//     // Handle the response, e.g., store the token in localStorage
//     console.log(data);
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <form onSubmit={handleLogin}>
//         <label htmlFor="username">Username:</label>
//         <input
//           type="text"
//           id="username"
//           name="username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />
//         <br />
//         <label htmlFor="password">Password:</label>
//         <input
//           type="password"
//           id="password"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <br />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }
