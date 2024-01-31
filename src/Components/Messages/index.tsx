// import React from "react";
// import { auth } from "../../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";

// interface MessageProps {
//   message: {
//     uid: string;
//     avatar: string;
//     name: string;
//     text: string;
//   };
// }

// const Message: React.FC<MessageProps> = ({ message }) => {
//   const [user] = useAuthState(auth);

//   return (
//     <div
//       className={`chat-bubble ${message.uid === user?.uid ? "right" : ""}`}
//     >
//       <img
//         className="chat-bubble__left"
//         src={message.avatar}
//         alt="user avatar"
//       />
//       <div className="chat-bubble__right">
//         <p className="user-name">{message.name}</p>
//         <p className="user-message">{message.text}</p>
//       </div>
//     </div>
//   );
// };

// export default Message;

import React, { useRef, useEffect } from "react";
import Moment from "react-moment";
import { Timestamp } from "firebase/firestore";

interface MessageProps {
  msg: {
    text: string;
    media: string;
    from: string;
    createdAt: Timestamp;
  };
  user1: string;
  getSenderName?: (userId: string) => string;

}

const Message: React.FC<MessageProps> = ({ msg, user1, getSenderName}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);

  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p>{getSenderName ? getSenderName(msg.from) : ""}</p>
      <p className={msg.from === user1 ? "me" : "friend"}>
        {msg.text}
        <br />
        <small>
          <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
};

export default Message;
