import './dialog.css';
import PropTypes from 'prop-types';

export default function Dialog({ setIsEnter, isEnter }) {
  if (isEnter) {
    setTimeout(() => {
      setIsEnter(false);
    }, 1500);
  }

  return (
    isEnter && (
      <div className="chat_dialog">
        <span>엔터는 사용할 수 없습니다 !!</span>
      </div>
    )
  );
}

Dialog.propTypes = {
  setIsEnter: PropTypes.func,
  isEnter: PropTypes.bool,
};
