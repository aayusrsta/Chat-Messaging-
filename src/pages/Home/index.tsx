import React, { useEffect, useState, FormEvent, useMemo, memo } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
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
import useFcmToken from "@/utils/hooks/useFcmToken";
import {Howl} from 'howler';
import NavBar from "@/Components/NavBar";

interface UserData {
  id: string;
  username: string;
  first_name: string;
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

const Home = () => {
  const sentMessageSound = new Howl({
    src: ['/sounds/sendMessage.mp3'],
  });
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
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const [addingMembersToGroup, setAddingMembersToGroup] =
    useState<boolean>(false);

  const saveFCMTokenForUser = async (userId: string, fcmToken: string) => {
    const userRef = doc(db, "users", userId);

    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        fcmToken: fcmToken,
      });
    } else {
      await setDoc(userRef, {
        fcmToken: fcmToken,
      });
    }
  };

  const userId = auth.currentUser?.uid || "";
  const receiverToken = useFcmToken()?.fcmToken || "";

  saveFCMTokenForUser(userId, receiverToken);

  const showAvailableUsers = (group: GroupChat) => {
    const usersNotInGroup = users.filter(
      (user) => !group.members.includes(user.id.toString())
    );
    setAvailableUsers(usersNotInGroup);
    setAddingMembersToGroup(true);
    setSelectedGroup(group);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
          console.error("User not logged in.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        };

        const response = await fetch("http://localhost:8000/api/users/getAll", {
          headers,
        });

        const userData = await response.json();
        console.log("List of Users:", userData.data.users);

        if (response.ok) {
          const filteredUsers = userData.data.users.filter(
            (user: UserData) => user.id.toString() !== user1
          );

          console.log("FILTERED USERS", filteredUsers, "USER!", user1);
          setUsers(filteredUsers);
        } else {
          console.error("Error fetching users:", userData.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  console.log(users, "THE USERS");

  const handleAddMemberToGroup = async (userId: string) => {
    if (selectedGroup) {
      const updatedMembers = [...selectedGroup.members, userId.toString()];
      await updateDoc(doc(db, "groups", selectedGroup.id), {
        members: updatedMembers,
      });
      setAddingMembersToGroup(false);
    }
  };

  const user1 = auth.currentUser?.uid || "";
  console.log("USER IDD", auth.currentUser);

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



  const handleCreateGroup = () => {
    setIsCreatingGroup(true);
  };
  const cancelCreateGroup = () => {
    setIsCreatingGroup(false);
  };
  const handleAddMember = (userId: string) => {
    setSelectedMembers((prevMembers) => [...prevMembers, userId.toString()]);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.filter((member) => member !== userId)
    );
  };

  const handleCreateGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (selectedMembers.length < 1) {
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
    const topic = groupId;
    

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
    setActiveUserId(id);

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
    setActiveUserId(user.id);
    const user2 = user.id.toString();
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
    sentMessageSound.play();

    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    if (!selectedGroup) {
      return;
    }

    const id = selectedGroup.id;
    const group_name = selectedGroup.name;
    let url = "";

    addDoc(collection(db, "group_messages", id, "chat"), {
      text,
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    setDoc(doc(db, "lastGrpMsg", id), {
      text,
      from: user1,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });
    setText("");

    for (const memberId of selectedGroup.members) {
      const memberToken = await getReceiverTokenForUser(memberId);
      console.log("Member Token==>", memberToken);

      if (memberToken) {
        const subscribeResponse = await fetch(
          "https://iid.googleapis.com/iid/v1/" +
            memberToken +
            "/rel/topics/" +
            id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "key=AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD",
            },
          }
        );
        if (!subscribeResponse.ok) {
          console.error(
            "Error subscribing member to topic:",
            subscribeResponse.statusText
          );
        }
      }
    }

    if (selectedGroup) {
      const topic = selectedGroup.id;
      const payload = {
        to: "/topics/" + topic,
        notification: {
          title: group_name,
          body: `${auth.currentUser?.displayName}: ${text}`,
        },
        data: {
          chatId: id,
          message: text,
          senderName: auth.currentUser?.displayName || "",
        },
      };

      try {
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD",
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const responseBody = await response.json();
          console.log("Response Body:", responseBody);
        }
        if (!response.ok) {
          console.error(
            "Error sending push notification:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error during fetch request:", error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    sentMessageSound.play();

    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    if (!chat) {
      return;
    }

    const user2 = chat.id;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url = "";

    addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    setDoc(doc(db, "lastMsg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
      senderName: auth.currentUser?.displayName || "",
    });
    setText("");

    console.log("USER STRING PASSED IS ", user2);
    const receiverToken = await getReceiverTokenForUser(user2);

    const payload = {
      to: receiverToken,
      notification: {
        title: auth.currentUser?.displayName || "New Message",
        body: text,
      },
      data: {
        chatId: id,
        message: text,
        senderName: auth.currentUser?.displayName || "",
      },
    };

    try {
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer AAAA5QBu1dg:APA91bH0B19O_TDVXeH_qOTAF5VA83ZjBb5N-x6vBGzHhtEH8BbjU-f4Vj03GvWLBZcL9v-96_d01cObNKYJvOYqrS4gLNr_0hBpW65-UkMHff8C5HnJZO5SwUM0GrN9NA06E2rIvTHD",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const responseBody = await response.json();
        console.log("Response Body:", responseBody);
      }
      if (!response.ok) {
        console.error("Error sending push notification:", response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch request:", error);
    }

  };
  const getReceiverTokenForUser = useMemo(() =>async (userId: string) => {
    try {
      const id = userId;
      const userDoc = await getDoc(doc(db, "users", `${id}`));

      if (userDoc.exists() && userDoc.data()) {
        const userData = userDoc.data();

        if (typeof userData === "object" && "fcmToken" in userData) {
          const receiverToken = userData.fcmToken || "";
          console.log("THE RECEIVED TOKEN IS", receiverToken);
          return receiverToken;
        } else {
          console.error(`Invalid data structure for user ${userId}`);
          return "";
        }
      } else {
        console.error(`User document does not exist for ${userId}`);
        return "";
      }
    } catch (error) {
      console.error(`Error fetching user document for ${userId}:`, error);
      return "";
    }
  }, []);

  console.log("THE CURRENT USER DETAILS:", auth.currentUser);

  const getSenderName = (userId: string) => {
    const sender = users.find((user) => user.id === userId);
    return sender ? sender.first_name : "";
  };

  return (
    <>
    <NavBar selectedGroup={selectedGroup} getReceiverTokenForUser={getReceiverTokenForUser} />
    <div className="home_container">
       <div className="side-nav">
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
            key={user.id}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
            isSelectable={isCreatingGroup}
            isActive={activeUserId === user.id}
            isSelected={selectedMembers.includes(user.id.toString())}
            onAddMember={() => handleAddMember(user.id.toString())}
            onRemoveMember={() => handleRemoveMember(user.id.toString())}
          />
        ))}
        <div className="groups_container">
          <p className="primary-text">Groups:</p>
          {groupChats.map((group) => (
            <Group
              key={group.id}
              group={group}
              onSelectGroup={selectGrp}
              isActive={activeUserId === group.id}
              user1={user1}
              handleAddMembersToGroup={showAvailableUsers}
            />
          ))}
          <div>
            {addingMembersToGroup && (
              <div className="add-members-section">
                <h3>Select Users to Add to the Group</h3>
                {availableUsers.map((user) => (
                  <div key={user.id} className="available-users">
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleAddMemberToGroup(user.id.toString())}
                    >
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
              <h3 className="no_conv">{chat.username}</h3>
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
              <button onClick={() => showAvailableUsers(selectedGroup)} className="add_members_btn">Add Members</button>

            </div>
            <div className="messages">
              <p style={{ textAlign: "center", color:"wheat", }}>
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
    </>
  );
};

export default memo(Home);
