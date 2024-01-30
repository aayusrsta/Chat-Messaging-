// import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { useState } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import NavBar from "../Components/NavBar";
import ChatBox from "./Chat";
import Welcome from "./Welcome";
import Home from "./Home";
function App() {
  const [user] = useAuthState(auth);

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
