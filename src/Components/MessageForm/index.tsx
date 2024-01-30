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
