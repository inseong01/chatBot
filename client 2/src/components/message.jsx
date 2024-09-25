import './message.css';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { MyContext } from '../App';
import BotMessage from './botMessage';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// https://swiperjs.com/swiper-api

export default function Message({ message, sendMessage }) {
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

  useEffect(() => {
    new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        clickable: false,
        type: 'bullets',
        el: '.swiper-pagination',
      },
    });
  }, []);

  switch (message.user_type) {
    case 'bot': {
      if (message.msg_type === 'projects') {
        const firstProjectMsg = message?.metadata[0];
        const secondProjectMsg = message?.metadata[1].metadata;
        const isQuestionsList = secondProjectMsg.metadata?.questions.length !== 0;

        // botMessage 함수 중복
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
          <>
            <div className={`${msgType} ${msgState}`}>
              <div className="msg projects">
                <BotMessage key={`1 bot project msg`} message={firstProjectMsg} sendMessage={sendMessage} />
              </div>
            </div>
            <div className={`${msgType} ${msgState}`}>
              <div className="msg projects">
                <div className="swiper">
                  <div className="swiper-wrapper">
                    {isQuestionsList &&
                      secondProjectMsg.questions.map((q, i) => (
                        <>
                          <div className="swiper-slide">
                            <div key={`${i}번째 질문`} className="qusetion" onClick={onClickQuestion(q)}>
                              <div>{q.data.img}</div>
                              <div>{q.q}</div>
                              <div>{q.data.describe}</div>
                            </div>
                          </div>
                        </>
                      ))}
                  </div>
                  <div className="swiper-pagination"></div>

                  <div className="swiper-button-prev"></div>
                  <div className="swiper-button-next"></div>
                </div>
              </div>
            </div>
          </>
        );
      } else {
        return (
          <div className={`${msgType} ${msgState}`}>
            <div className="msg">
              <BotMessage key={message.id} message={message} sendMessage={sendMessage} />
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

Message.propTypes = {
  message: PropTypes.object,
  sendMessage: PropTypes.func,
};
