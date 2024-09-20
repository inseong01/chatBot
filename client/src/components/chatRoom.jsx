import './chatRoom.css';
import PropTypes from 'prop-types';
import Message from './message';

const getOpponentStatus = (roomId, opntStatusArr) => {
  if (!roomId) return;
  for (let i = 0; i < opntStatusArr.length; i++) {
    if (roomId !== opntStatusArr[i].room_id) continue;
    return opntStatusArr[i];
  }
};

export default function ChatRoom({ messages, opponentStatusArr, roomId }) {
  const oppntStatus = getOpponentStatus(roomId, opponentStatusArr);

  return (
    <div className="chat-room">
      {messages.map((message, index) => (
        <Message key={index} message={message} opponentStatusArr={opponentStatusArr} />
      ))}
      {oppntStatus?.is_typing && (
        <div className="receive">
          <div className="msg">
            <div className="typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ChatRoom.propTypes = {
  messages: PropTypes.array,
  opponentStatusArr: PropTypes.array,
  roomId: PropTypes.string,
};
