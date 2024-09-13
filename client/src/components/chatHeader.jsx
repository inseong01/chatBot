import './chatHeader.css';
import PropTypes from 'prop-types';

export default function ChatHeader({ icon, title, btn, who }) {
  let titleContext = who ? `${title} ${who}` : `${title}`;
  return (
    <div className="chat-header">
      {icon && <div className="icon">?</div>}
      <div className="title">{titleContext}</div>
      {btn && <div className="close-btn">X</div>}
    </div>
  );
}

ChatHeader.propTypes = {
  icon: PropTypes.bool,
  title: PropTypes.string,
  btn: PropTypes.bool,
  who: PropTypes.string,
};
