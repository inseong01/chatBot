import { useContext } from 'react';
import './chatHeader.css';
import { MyContext } from '../App';

export default function ChatHeader() {
  const who = useContext(MyContext);
  return (
    <div className="chat-header">
      <div className="icon">?</div>
      <div className="title">{`ChatBot ${who}`}</div>
      <div className="close-btn">X</div>
    </div>
  );
}
