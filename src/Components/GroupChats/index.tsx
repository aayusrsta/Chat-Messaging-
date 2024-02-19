import React from "react";

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  user1: string;
  createdBy:string;
}

interface GroupProps {
  group: {
    id: string;
    name: string;
    members: string[];
    user1: string; 
    createdBy:string;
  };
  isActive:boolean;
  onSelectGroup: (group: GroupChat) => void;
  user1: string;
  handleAddMembersToGroup: (group: GroupChat) => void;

}

const Group: React.FC<GroupProps> = ({ group, onSelectGroup, user1, handleAddMembersToGroup, isActive }) => {
  const isMember = group.members.includes(user1.toString());

  return (
    <div
      className={`group_info ${isMember ? "visible" : "hidden"} ${isActive ? "active" : ""}`}
      onClick={() => onSelectGroup(group)}
    >
      <div className="group_infos">
        <div
          className={`primary-text group_detail ${isActive ? "active" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <h4>
            {group.name} ({group.members.length})
          </h4>
          {/* <p>Members: {group.members.length}</p> */}
          {/* {isMember && (
      <button onClick={() => handleAddMembersToGroup(group)}>Add Members</button>
    )} */}
        </div>
      </div>
    </div>
  );
};

export default Group;
