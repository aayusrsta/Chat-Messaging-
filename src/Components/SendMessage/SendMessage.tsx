import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

interface SendMessageProps {
  scroll: React.RefObject<HTMLSpanElement>;
}

const SendMessage: React.FC<SendMessageProps> = ({ scroll }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim() === "") {
      alert("Enter valid message");
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const { uid, displayName, photoURL } = user;
      await addDoc(collection(db, "messages"), {
        text: message,
        name: displayName,
        avatar: photoURL,
        createdAt: serverTimestamp(),
        uid,
      });
    }

    setMessage("");

    // Scroll to the latest message
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={(event) => sendMessage(event)} className="send-message">
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="form-input__input"
        placeholder="Aa"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">
      <Image
          src="/images/send.png"
          alt="ReactJs logo"
          width={100}
          height={50}
        />
      </button>
    </form>
  );
};

export default SendMessage;
