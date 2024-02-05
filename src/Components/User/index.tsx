import React, { useEffect, useState } from "react";
import { onSnapshot, doc, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";

interface UserData {
  uid: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
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
    name: string;
  } | null;
  isSelectable?: boolean;
  isSelected?: boolean;
  onAddMember?: () => void;
  onRemoveMember?: () => void;
}

const User: React.FC<UserProps> = ({
  user1,
  user,
  selectUser,
  chat,
  isSelectable,
  isSelected,
  onAddMember,
  onRemoveMember,
}) => {
  const user2 = user?.uid;
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
          <div className="user_info">
            <div
              className="primary-text user_detail"
              style={{ cursor: "pointer" }}
            >
              <h4>{user.name}</h4>
            </div>
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
