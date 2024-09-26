import './message.css';
import { useContext } from 'react';
import { MyContext } from '../App';
import PropTypes from 'prop-types';
import BotMessage from './botMessage';
import ProjectSwiper from './projectSwiper';

function Message({ message, sendMessage }) {
  const content = message.content;
  const who = useContext(MyContext);

  let msgType = '';
  if (who === 'admin') {
    msgType = message.user_type === 'admin' ? 'send' : 'receive';
  } else if (who === 'client') {
    msgType = message.user_type !== 'admin' && message.user_type !== 'bot' ? 'send' : 'receive';
  } else {
    console.error('who is not defined');
  }

  const msgState = message.is_read ? 'read' : 'unread';

  switch (message.user_type) {
    case 'bot': {
      if (message.msg_type === 'projects') {
        const firstProjectMsg = message?.metadata[0];
        const secondProjectMsg = message?.metadata[1].metadata;

        return (
          <>
            <div className={`${msgType}`}>
              <div className="msg projects_1">
                <BotMessage key={0} message={firstProjectMsg} sendMessage={sendMessage} />
              </div>
            </div>
            <div className={`${msgType}`}>
              <div className="msg projects_2">
                <ProjectSwiper key={1} secondProjectMsg={secondProjectMsg} sendMessage={sendMessage} />
              </div>
            </div>
          </>
        );
      } else {
        return (
          <div className={`${msgType}`}>
            <div className="msg">
              <BotMessage key={0} message={message} sendMessage={sendMessage} />
            </div>
          </div>
        );
      }
    }
    default: {
      return (
        <div className={`${msgType} ${msgState}`}>
          <div className="msg">{content}</div>
        </div>
      );
    }
  }
}

export default Message;

Message.propTypes = {
  message: PropTypes.object,
  sendMessage: PropTypes.func,
};
