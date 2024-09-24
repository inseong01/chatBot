import { useEffect, useRef, useState } from 'react';
import './list.css';
import PropTypes from 'prop-types';

export default function List({ list, setRoomId, messages }) {
  const [clickable, setClickacble] = useState(false);
  const listTag = useRef(null);

  const { room_id, online_at, status } = list;
  const time = new Date(online_at).toLocaleTimeString('ko-KR');
  const unreadMsg = messages.filter(
    (msg) => msg.room_id === room_id && msg.user_type === 'client' && msg.is_read === false
  );

  const onClickChatRoom = () => {
    setRoomId(room_id);
    setClickacble(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (listTag.current && !listTag.current.contains(e.target)) {
        setClickacble(false);
      }
    };

    document.querySelector('.list-body').addEventListener('mousedown', handleClickOutside);
    return () => {
      document.querySelector('.list-body').removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`list ${clickable ? 'on' : ''}`} onClick={onClickChatRoom} ref={listTag}>
        <div className="profile"></div>
        <div className="list-msg">
          <div className="top">
            <div className="name">{room_id.slice(0, 3)}</div>
            <div className="time">{status === 'online' ? '활성화' : '비활성화'}</div>
          </div>
          <div className="content">안 읽은 메시지 {unreadMsg.length}</div>
        </div>
      </div>
    </>
  );
}

List.propTypes = {
  list: PropTypes.object,
  setRoomId: PropTypes.func,
  messages: PropTypes.array,
};
