import './chatBotBtn.css';
import PropTypes from 'prop-types';

export default function ChatBotBtn({ isLinksList, links, onClickLink }) {
  return (
    <div className="qusetion-wrap">
      {isLinksList &&
        links.map((q, i) => (
          <div key={i} className="qusetion" onClick={onClickLink(q)}>
            {q.q_title}
          </div>
        ))}
    </div>
  );
}

ChatBotBtn.propTypes = {
  isLinksList: PropTypes.bool,
  links: PropTypes.array,
  onClickLink: PropTypes.func,
};
