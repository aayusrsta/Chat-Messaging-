import React, { ChangeEvent, FormEvent } from "react";

interface MessageFormProps {
  handleSubmit: (e: FormEvent) => void;
  text: string;
  setText: (text: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  handleSubmit,
  text,
  setText,
}) => {
  return (
    <form className="message_form" onSubmit={handleSubmit}>      
       <div>
        <input
          type="text"
          placeholder="Enter message"
          value={text}
          style={{color:'black'}}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setText(e.target.value)
          }
        />
      </div>
      <div>
        <button className="btn" type="submit">
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
// import React, { ChangeEvent, FormEvent } from "react";
// import { messaging } from "../../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { getAuth } from "firebase/auth";
// import { getToken } from "firebase/messaging";

// interface MessageFormProps {
//   handleSubmit: (e: FormEvent) => void;
//   text: string;
//   setText: (text: string) => void;
// }

// const MessageForm: React.FC<MessageFormProps> = ({
//   handleSubmit,
//   text,
//   setText,
// }) => {
//   const auth = getAuth();
//   const [user] = useAuthState(auth);

//   const requestPermission = async () => {
//     try {
//       const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
//       if (currentToken) {
//         console.log("Token:", currentToken);
//         // Save the token to your database or use it as needed
//       } else {
//         console.log("No registration token available. Request permission to generate one.");
//       }
//     } catch (err) {
//       console.log("An error occurred while retrieving token. ", err);
//     }
//   };

//   const handleFormSubmit = (e: FormEvent) => {
//     e.preventDefault();

//     // Request permission to generate FCM token
//     requestPermission();

//     // Continue with your existing form submission logic
//     handleSubmit(e);
//   };

//   return (
//     <form className="message_form" onSubmit={handleFormSubmit}>
//       <div>
//         <input
//           type="text"
//           placeholder="Enter message"
//           value={text}
//           style={{ color: "black" }}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setText(e.target.value)
//           }
//         />
//       </div>
//       <div>
//         <button className="btn" type="submit">
//           Send
//         </button>
//       </div>
//     </form>
//   );
// };

// export default MessageForm;
