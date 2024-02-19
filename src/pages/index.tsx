
import type { AppProps } from "next/app";
import { useEffect } from "react";
import app, { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import NavBar from "../Components/NavBar";
import Welcome from "./Welcome";
import Home from "./Home";
import { getMessaging, onMessage } from "@firebase/messaging";
import useFcmToken from "@/utils/hooks/useFcmToken";
import {Howl} from 'howler';

function App({ Component, pageProps }: AppProps) {
  const [user] = useAuthState(auth);
  const { fcmToken,notificationPermissionStatus } = useFcmToken();
  
  fcmToken && console.log('FCM token:', fcmToken);
  const sentMessageSound = new Howl({
    src: ['/sounds/notification.mp3'],
  });

  useEffect(() => {
   
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground push notification received:', payload);
        sentMessageSound.play();

        
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

    
  }, []);

  return (
    <div className="App">
      {/* <NavBar /> */}
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

