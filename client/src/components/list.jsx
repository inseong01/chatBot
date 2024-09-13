import './list.css';

export default function List() {
  return (
    <>
      <div className="list">
        <div className="profile"></div>
        <div className="list-msg">
          <div className="top">
            <div className="name">이름</div>
            <div className="time">00:00</div>
          </div>
          <div className="content">전달 받은 메시지 내용 표시</div>
        </div>
      </div>
    </>
  );
}
