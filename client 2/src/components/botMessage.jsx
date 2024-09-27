import './botMessage.css';
import PropTypes from 'prop-types';
import ChatBotBtn from './chatBotBtn';

let clickable = true;

function BotMessage({ msg, sendMessage }) {
  const msgObj = msg.msg_type === 'projects' ? msg.metadata[0] : msg.metadata;
  const { title, subtitle, links } = msgObj;
  const isLinksList = links.length !== 0;

  const onClickLink = (q) => {
    return () => {
      console.log(q);
      // 연속 클릭 방지
      if (!clickable) return;
      clickable = false;
      setTimeout(() => {
        clickable = true;
      }, 1000);
      // 선택 질문 메시지 배열에 추가
      sendMessage(q.q_title);
      // 요청 전달
      setTimeout(() => {
        sendMessage(undefined, q.id, 'bot_answer');
      }, 0);
    };
  };

  return (
    <div className={`bot-msg ${msg.id === '0' ? 'first' : ''}`}>
      <div className="title">{title}</div>
      <div className="subtitle">{subtitle}</div>
      <ChatBotBtn isLinksList={isLinksList} onClickLink={onClickLink} links={links} />
    </div>
  );
}

export default BotMessage;

BotMessage.propTypes = {
  msg: PropTypes.object,
  sendMessage: PropTypes.func,
};
