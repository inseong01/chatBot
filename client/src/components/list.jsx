import { useEffect, useRef, useState } from 'react';
import './list.css';
import PropTypes from 'prop-types';

export default function List({ list, setRoomId }) {
  const [clickable, setClickacble] = useState(false);
  const listTag = useRef(null);
  const { room_id, last_updated, online_at } = list;

  const time = new Date(online_at).toLocaleTimeString('ko-KR');

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
            <div className="time">{time}</div>
          </div>
          <div className="content">전달 받은 메시지 내용 표시</div>
        </div>
      </div>
    </>
  );
}

List.propTypes = {
  list: PropTypes.object,
  setRoomId: PropTypes.func,
};
