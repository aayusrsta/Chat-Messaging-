import React from "react";

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  user1: string;
}

interface GroupProps {
  group: {
    id: string;
    name: string;
    members: string[];
    user1: string; 
  };
  onSelectGroup: (group: GroupChat) => void;
  user1: string;
}

const Group: React.FC<GroupProps> = ({ group, onSelectGroup, user1 }) => {
  const isMember = group.members.includes(user1);

  return (
    <div
      className={`group_info ${isMember ? "visible" : "hidden"}`}
      onClick={() => onSelectGroup(group)}
    >
      <div className="group_info">
        <div
          className="primary-text group_detail"
          style={{ cursor: "pointer" }}
        >
          <h4>
            {group.name} <p>Members: {group.members.length}</p>{" "}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Group;