import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { db, auth, storage } from "../../firebase";
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
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import Message from "../../Components/Messages";
import MessageForm from "@/Components/MessageForm";
import User from "@/Components/User";
import Group from "@/Components/GroupChats";
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
}

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  user1: string;
}

interface GroupMessageData {
  text: string;
  from: string;
  createdAt: Timestamp;
  media: string;
}

const Home: React.FC<HomeProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [chat, setChat] = useState<UserData | null>(null);
  const [text, setText] = useState<string>("");
  const [img, setImg] = useState<File | null>(null);
  const [msgs, setMsgs] = useState<MessageData[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);

  const user1 = auth.currentUser?.uid || "";
  console.log("USER IDD", user1);

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
  const cancelCreateGroup=()=>{
    setIsCreatingGroup(false);
  }
  const handleAddMember = (userId: string) => {
    setSelectedMembers((prevMembers) => [...prevMembers, userId]);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.filter((member) => member !== userId)
    );
  };

  const handleCreateGroupSubmit = async (e: FormEvent) => {
    const groupData = {
      name: groupName,
      members: [...selectedMembers, user1],
    };

    const groupRef = await addDoc(collection(db, "groups"), groupData);

    const groupId = groupRef.id;
    const updatedGroupData = {
      ...groupData,
      id: groupId,
    };

    // Update the group document with the correct id
    await setDoc(doc(db, "groups", groupId), updatedGroupData);

    const groupMsgsRef = collection(db, "group_messages", groupId, "chat");
    await addDoc(groupMsgsRef, {
      text,
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      media: "",
    });

    setText("");
    setGroupName("");
    setSelectedMembers([]);
    setIsCreatingGroup(false);
  };

  const selectGrp = async (group: GroupChat) => {
    setSelectedGroup(group);
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
    setImg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
    });

    setText("");
    setImg(null);
  };
  // const handleSelectGroup = (groupId: string) => {
  //   setChat(null);
  //   const selectedGroup = groupChats.find((group) => group.id === groupId);
  //   console.log("SELECTED GROUP===>", selectedGroup);
  //   setSelectedGroup(selectedGroup || null);
  // };
  console.log("USERRSSS", users);
  const getSenderName = (userId: string) => {
    const sender = users.find((user) => user.uid === userId);
    return sender ? sender.name : '';
  };
  
  return (
    <div className="home_container">
      <div>
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
            />
          ))}
          <div className="group_creation">
            <button onClick={handleCreateGroup} className="create-button">Create Group</button>
            {isCreatingGroup && (
              <div className="group_form">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <p>Selected Members:</p>
                <ul>
                  {selectedMembers.map((member) => (
                    <li key={member}> </li>
                  ))}
                </ul>
                <div>
                <button  onClick={handleCreateGroupSubmit}>Create +</button>
                <p onClick={cancelCreateGroup} style={{cursor:'pointer'}}>Cancel</p>
                </div>
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
                    <Message key={i} msg={msg} user1={user1} />
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
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user1} getSenderName={getSenderName}/>
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
