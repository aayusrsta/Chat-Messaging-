// // import "@/styles/globals.css";
// import type { AppProps } from "next/app";

// import { useEffect, useState } from "react";
// import { auth } from "../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import NavBar from "../Components/NavBar";
// import ChatBox from "./Chat";
// import Welcome from "./Welcome";
// import Home from "./Home";
// import { getToken } from "@firebase/messaging";
// function App() {
//   const [user] = useAuthState(auth);
 

//   return (
//     <div className="App">
//       <NavBar />
//       {!user ? (
//         <Welcome />
//       ) : (
//         <>
//           <Home />
//         </>
//       )}
//     </div>
//   );
// }

// export default App;
// index.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import NavBar from "../Components/NavBar";
import Welcome from "./Welcome";
import Home from "./Home";
import { getToken, getMessaging } from "@firebase/messaging";

function App({ Component, pageProps }: AppProps) {
  const [user] = useAuthState(auth);

  useEffect(() => {
    // Register the service worker
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

    if (user) {
      const messaging = getMessaging();
      getToken(messaging, { vapidKey: 'BCVDQWcX1Jbic82j_hOpHbasdrcHywqnKwWL7xDxYsMPbhmYGillMguXKy8yMSwcoC3zwMcxPyUPsYkoKGK7kAg' })
        .then((currentToken) => {
          if (currentToken) {
            console.log("The token is:", currentToken);
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        })
        .catch((err) => {
          console.log("An error occurred while retrieving token. ", err);
        });
    }
  }, [user]);

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
