import './botMessage.css';
import PropTypes from 'prop-types';
import ChatBotBtn from './chatBotBtn';

let clickable = true;

function BotMessage({ message, sendMessage }) {
  const { title, subtitle, questions } = message.metadata;
  const isQuestionsList = questions.length !== 0;

  const onClickQuestion = (q) => {
    return () => {
      // 연속 클릭 방지
      if (!clickable) return;
      clickable = false;
      setTimeout(() => {
        clickable = true;
      }, 1000);

      const selectedQusetion = q;
      // 선택 질문 메시지 배열에 추가
      sendMessage(selectedQusetion.q);
      // 요청 전달
      sendMessage(undefined, selectedQusetion.id, 'bot_answer');
    };
  };

  return (
    <div className={`bot-msg ${message.id === '0' ? 'first' : ''}`}>
      <div className="title">{title}</div>
      <div className="subtitle">{subtitle}</div>
      <ChatBotBtn isQuestionsList={isQuestionsList} onClickQuestion={onClickQuestion} questions={questions} />
    </div>
  );
}

export default BotMessage;

BotMessage.propTypes = {
  message: PropTypes.object,
  sendMessage: PropTypes.func,
};
