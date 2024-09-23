import './listWrap.css';
import ChatHeader from './chatHeader';
import List from './list';
import PropTypes from 'prop-types';

export default function ListWrap({ userList, setRoomId, messages }) {
  return (
    <>
      <div className="list-wrap">
        <ChatHeader icon={false} title={'List'} btn={false} />
        <div className="list-body">
          {userList &&
            userList
              .sort((a, b) => new Date(a[0].last_updated) - new Date(b[0].last_updated))
              .map((list) => {
                return (
                  <List key={list[0].room_id} list={list[0]} setRoomId={setRoomId} messages={messages} />
                );
              })}
        </div>
      </div>
    </>
  );
}

ListWrap.propTypes = {
  userList: PropTypes.array,
  setRoomId: PropTypes.func,
  messages: PropTypes.array,
};
