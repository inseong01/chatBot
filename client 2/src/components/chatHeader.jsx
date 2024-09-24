import './chatHeader.css';
import { useContext } from 'react';
import { MyContext } from '../App';
import PropTypes from 'prop-types';

export default function ChatHeader({ oppntUserInfo }) {
  const who = useContext(MyContext);

  return (
    <div className="chat-header">
      <div
        className={`icon ${oppntUserInfo.status ? 'online' : 'offline'}`}
        title={`현재 관리자는 ${oppntUserInfo.status ? '온라인' : '오프라인'}입니다`}
      >
        <span></span>
        관리자
      </div>
      <div className="title">{`ChatBot ${who}`}</div>
      <div className="close-btn" title="닫기">
        X
      </div>
    </div>
  );
}

ChatHeader.propTypes = {
  oppntUserInfo: PropTypes.object,
};
