import './listWrap.css';
import ChatHeader from './chatHeader';
import List from './list';
import PropTypes from 'prop-types';

export default function ListWrap({ userList, setRoomId }) {
  return (
    <>
      <div className="list-wrap">
        <ChatHeader icon={false} title={'List'} btn={false} />
        <div className="list-body">
          {userList.map((list) => (
            <List key={list[0].room_id} list={list[0]} setRoomId={setRoomId} />
          ))}
        </div>
      </div>
    </>
  );
}

ListWrap.propTypes = {
  userList: PropTypes.array,
  setRoomId: PropTypes.func,
};
