import './chatBotBtn.css';
import PropTypes from 'prop-types';

export default function ChatBotBtn({ isQuestionsList, questions, onClickQuestion }) {
  return (
    <div className="qusetion-wrap">
      {isQuestionsList &&
        questions.map((q, i) => (
          <div key={i} className="qusetion" onClick={onClickQuestion(q)}>
            {q.q}
          </div>
        ))}
    </div>
  );
}

ChatBotBtn.propTypes = {
  isQuestionsList: PropTypes.bool,
  questions: PropTypes.array,
  onClickQuestion: PropTypes.func,
};
