import React, { useEffect, useState } from "react";
import { onSnapshot, doc, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";

interface UserData {
  id: string;
  username: string;
  first_name:string;
}

interface LastMsgData {
  from: string;
  text: string;
  unread: boolean;
}
interface UserProps {
  user1: string;
  user: UserData;
  selectUser: (user: UserData) => void;
  chat: {
    username: string;
  } | null;
  isActive?: boolean;

  isSelectable?: boolean;
  isSelected?: boolean;
  onAddMember?: () => void;
  onRemoveMember?: () => void;
}

const User: React.FC<UserProps> = ({
  user1,
  user,
  selectUser,
  isSelectable,
  isActive,
  isSelected,
  onAddMember,
  onRemoveMember,
}) => {
  const user2 = user?.id;
  const [data, setData] = useState<LastMsgData | DocumentData | undefined>(
    undefined
  );

  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, "lastMsg", id), (doc) => {
      setData(doc.data() as LastMsgData);
    });
    return () => unsub();
  }, [user1, user2]);

  return (
    <>
      {user && (
        <div onClick={() => selectUser(user)}>
          <div className={`user_info ${isActive ? "active" : ""}`}>
            <div
              className={`primary-text user_detail ${isActive ? "active" : ""}`}
              style={{ cursor: "pointer" }}
            >
              <h4>{user.username} {user.id} </h4>
            </div>
            {/* <div
            className={`user_status ${user.isOnline ? "online" : "offline"}`}
          ></div> */}
            {isSelectable !== undefined &&
              isSelected !== undefined &&
              onAddMember &&
              onRemoveMember && (
                <div className="user_actions">
                  {isSelectable && isSelected ? (
                    <button onClick={onRemoveMember}>Remove</button>
                  ) : isSelectable ? (
                    <button onClick={onAddMember}>Add</button>
                  ) : null}
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default User;
