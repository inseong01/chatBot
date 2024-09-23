import './chatHeader.css';
import { useContext } from 'react';
import { MyContext } from '../App';
import PropTypes from 'prop-types';

export default function ChatHeader({ oppntUserInfo }) {
  const who = useContext(MyContext);
  console.log(oppntUserInfo);
  return (
    <div className="chat-header">
      <div className="icon">?</div>
      <div className="title">
        {`ChatBot ${who}`} {oppntUserInfo.status && `- Admin is ${oppntUserInfo.status}`}
      </div>
      <div className="close-btn">X</div>
    </div>
  );
}

ChatHeader.propTypes = {
  oppntUserInfo: PropTypes.object,
};
