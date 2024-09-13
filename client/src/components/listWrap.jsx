import './listWrap.css';
import ChatHeader from './chatHeader';
import List from './list';

export default function ListWrap() {
  return (
    <>
      <div className="list-wrap">
        <ChatHeader icon={false} title={'List'} btn={false} />
        <div className="list-body">
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
          <List />
        </div>
      </div>
    </>
  );
}
