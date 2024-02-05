
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
