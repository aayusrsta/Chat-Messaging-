import React, { useEffect, useState, FormEvent } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import Message from "../../Components/Messages";
import MessageForm from "@/Components/MessageForm";
import User from "@/Components/User";
import Group from "@/Components/GroupChats";
import { getMessaging, getToken, onMessage } from "@firebase/messaging";
import { onBackgroundMessage } from "@firebase/messaging/sw";
interface HomeProps {}

interface UserData {
  uid: string;
  name: string;
  isOnline: boolean;
}

interface MessageData {
  text: string;
  from: string;
  to: string;
  createdAt: Timestamp;
  media: string;
  createdBy: string;
}

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  user1: string;
  createdBy: string;
}

const Home: React.FC<HomeProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [chat, setChat] = useState<UserData | null>(null);
  const [text, setText] = useState<string>("");
  const [msgs, setMsgs] = useState<MessageData[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [addingMembersToGroup, setAddingMembersToGroup] =
    useState<boolean>(false);
  useEffect(() => {
    console.log("INSIDE THE USEEFFECT HOOK");
    const messaging = getMessaging();

    const handleIncomingMessage = async (payload: any) => {
      console.log("Received message=====>>>>:", payload);

      const senderName = payload.data.senderName;
      const receiverToken = await getToken(messaging);
      console.log("Receiver FCM Token:", receiverToken);

      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD",
        },
        body: JSON.stringify({
          to: receiverToken,
          notification: {
            title: senderName,
            body: payload.data.message,
          },
          data: {
            chatId: payload.data.chatId,
            message: payload.data.message,
            senderName,
          },
        }),
      });
    };

    // const unsubscribe = onMessage(messaging, (payload) => {
    //   console.log('Message received outside handleIncomingMessage:', payload);
    // });
    const unsubscribe = onMessage(messaging, handleIncomingMessage);

    return () => unsubscribe();
  }, []);

  const showAvailableUsers = (group: GroupChat) => {
    const usersNotInGroup = users.filter(
      (user) => !group.members.includes(user.uid)
    );
    setAvailableUsers(usersNotInGroup);
    setAddingMembersToGroup(true);
    setSelectedGroup(group);
  };

  const handleAddMemberToGroup = async (userId: string) => {
    if (selectedGroup) {
      const updatedMembers = [...selectedGroup.members, userId];
      await updateDoc(doc(db, "groups", selectedGroup.id), {
        members: updatedMembers,
      });
      setAddingMembersToGroup(false);
    }
  };

  const user1 = auth.currentUser?.uid || "";
  // console.log("USER IDD", user1);

  useEffect(() => {
    const groupsRef = collection(db, "groups");
    const unsub = onSnapshot(groupsRef, (querySnapshot) => {
      let groups: GroupChat[] = [];
      querySnapshot.forEach((doc) => {
        groups.push(doc.data() as GroupChat);
      });
      setGroupChats(groups);
    });
    return () => unsub();
  }, [user1]);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "not-in", [user1]));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users: UserData[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserData);
      });
      setUsers(users);
    });
    return () => unsub();
  }, [user1]);

  const handleCreateGroup = () => {
    setIsCreatingGroup(true);
  };
  const cancelCreateGroup = () => {
    setIsCreatingGroup(false);
  };
  const handleAddMember = (userId: string) => {
    setSelectedMembers((prevMembers) => [...prevMembers, userId]);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.filter((member) => member !== userId)
    );
  };

  const handleCreateGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (selectedMembers.length < 2) {
      alert("Please select at least two users to create a group.");
      return;
    }

    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    const createdBy = auth.currentUser?.displayName || "";

    const groupData = {
      name: groupName,
      members: [...selectedMembers, user1],
      createdBy,
    };

    const groupRef = await addDoc(collection(db, "groups"), groupData);

    const groupId = groupRef.id;
    const updatedGroupData = {
      ...groupData,
      id: groupId,
    };

    await setDoc(doc(db, "groups", groupId), updatedGroupData);

    const groupMsgsRef = collection(db, "group_messages", groupId, "chat");
    await addDoc(groupMsgsRef, {
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      createdBy: `${auth.currentUser?.displayName} created the group`,
    });

    setGroupName("");
    setSelectedMembers([]);
    setIsCreatingGroup(false);
  };

  const selectGrp = async (group: GroupChat) => {
    setSelectedGroup(group);
    setIsCreatingGroup(false);
    setChat(null);

    const id = group.id;
    console.log("GROUP DETAIL:=====>", group);

    const msgsRef = collection(db, "group_messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs: MessageData[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data() as MessageData);
      });
      setMsgs(msgs);
    });

    const docSnap = await getDoc(doc(db, "lastGrpMsg", id));

    if (docSnap && docSnap.exists() && docSnap.data()?.from !== user1) {
      await updateDoc(doc(db, "lastGrpMsg", id), { unread: false });
    }
  };

  const selectUser = async (user: UserData) => {
    setSelectedGroup(null);
    setChat(user);

    const user2 = user.uid;
    console.log("SECOND USERRR", user2);
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs: MessageData[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data() as MessageData);
      });
      setMsgs(msgs);
    });

    const docSnap = await getDoc(doc(db, "lastMsg", id));

    if (docSnap && docSnap.exists() && docSnap.data()?.from !== user1) {
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const handleGroupChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    if (!selectedGroup) {
      return;
    }

    const id = selectedGroup.id;

    let url = "";

    await addDoc(collection(db, "group_messages", id, "chat"), {
      text,
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    await setDoc(doc(db, "lastGrpMsg", id), {
      text,
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });

    setText("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    if (!chat) {
      return;
    }

    const user2 = chat.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url = "";

    await addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    await setDoc(doc(db, "lastMsg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
      senderName: auth.currentUser?.displayName || "",
    });

    setText("");
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!text.trim()) {
  //     return;
  //   }
  //   if (!chat) {
  //     return;
  //   }

  //   const user2 = chat.uid;
  //   const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

  //   let url = "";

  //   const senderName = auth.currentUser?.displayName || "";
  //   const message = text;

  //   await addDoc(collection(db, "messages", id, "chat"), {
  //     text,
  //     from: user1,
  //     to: user2,
  //     createdAt: Timestamp.fromDate(new Date()),
  //     media: url || "",
  //   });

  //   // Update the payload for FCM notification
  //   const messaging=getMessaging();
  //   const receiverToken=getToken(messaging);
  //   console.log("THE RECEIVER TOKEN", receiverToken)
  //   const payload = {
  //     to: receiverToken,
  //     notification: {
  //       title: senderName,
  //       body: message,
  //     },
  //     data: {
  //       chatId: id,
  //       message,
  //       senderName,
  //     },
  //   };

  //   // Send the FCM notification
  //   await fetch("https://fcm.googleapis.com/fcm/send", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization:
  //         "Bearer AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD", // Replace with your server key
  //     },
  //     body: JSON.stringify(payload),
  //   });

  //   await setDoc(doc(db, "lastMsg", id), {
  //     text,
  //     from: user1,
  //     to: user2,
  //     createdAt: Timestamp.fromDate(new Date()),
  //     media: url || "",
  //     unread: true,
  //     senderName,
  //   });

  //   setText("");
  // };

  // console.log("current user====>>", auth.currentUser?.displayName);
  const getSenderName = (userId: string) => {
    const sender = users.find((user) => user.uid === userId);
    return sender ? sender.name : "";
  };

  return (
    <div className="home_container">
      <div>
        <div className="group_creation">
          <button
            onClick={handleCreateGroup}
            className={`create-button ${
              isCreatingGroup ? "hidden" : "visible"
            }`}
          >
            Create Group
          </button>
          {isCreatingGroup && (
            <div className="group_form">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <div className="create-cancel">
                <button onClick={handleCreateGroupSubmit}>Create +</button>
                <button
                  onClick={cancelCreateGroup}
                  style={{ cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="primary-text">Available Users:</p>
        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
            isSelectable={isCreatingGroup}
            isSelected={selectedMembers.includes(user.uid)}
            onAddMember={() => handleAddMember(user.uid)}
            onRemoveMember={() => handleRemoveMember(user.uid)}
          />
        ))}
        <div className="groups_container">
          <p className="primary-text">Groups:</p>
          {groupChats.map((group) => (
            <Group 
              key={group.id}
              group={group}
              onSelectGroup={selectGrp}
              user1={user1}
              handleAddMembersToGroup={showAvailableUsers}
            />
          ))}
          <div>
            {addingMembersToGroup && (
              <div className="add-members-section">
                <h3>Select Users to Add to the Group</h3>
                {availableUsers.map((user) => (
                  <div key={user.uid} className="available-users">
                    <span>{user.name}</span>
                    <button onClick={() => handleAddMemberToGroup(user.uid)}>
                      Add +
                    </button>
                  </div>
                ))}
                <button onClick={() => setAddingMembersToGroup(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3 className="no_conv">{chat.name}</h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message
                      key={i}
                      msg={msg}
                      user1={user1}
                      getSenderName={getSenderName}
                    />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
            />
          </>
        ) : selectedGroup ? (
          <>
            <div className="messages_user">
              <h3 className="no_conv">{selectedGroup.name}</h3>
            </div>
            <div className="messages">
              <p style={{ textAlign: "center" }}>
                {selectedGroup.createdBy} created the group
              </p>
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message
                      key={i}
                      msg={msg}
                      user1={user1}
                      getSenderName={getSenderName}
                    />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleGroupChatSubmit}
              text={text}
              setText={setText}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};

export default Home;
