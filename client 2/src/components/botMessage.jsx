import './botMessage.css';
import PropTypes from 'prop-types';

export default function BotMessage({ message, sendMessage }) {
  const { title, subtitle, questions } = message.metadata;
  const isQuestionsList = questions.length !== 0;

  const onClickQuestion = (q) => {
    return () => {
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
      <div className="qusetion-wrap">
        {isQuestionsList &&
          questions.map((q, i) => (
            <div key={`${i}번째 질문`} className="qusetion" onClick={onClickQuestion(q)}>
              {q.q}
            </div>
          ))}
      </div>
    </div>
  );
}

BotMessage.propTypes = {
  message: PropTypes.object,
  sendMessage: PropTypes.func,
};
