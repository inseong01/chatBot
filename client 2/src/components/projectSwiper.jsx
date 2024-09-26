import './projectSwiper.css';
import PropsType from 'prop-types';
import { useEffect } from 'react';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ChatBotBtn from './chatBotBtn';

// https://swiperjs.com/swiper-api

let clickable = true;

export default function ProjectSwiper({ secondProjectMsg, sendMessage }) {
  const isQuestionsList = secondProjectMsg.metadata?.lists.length !== 0;
  console.log(secondProjectMsg);
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

  // botMessage 함수 중복
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
    <div className="swiper bot-msg">
      <div className="swiper-wrapper">
        {isQuestionsList &&
          secondProjectMsg.lists.map((q, i) => (
            <div className="swiper-slide" key={i}>
              <div className="project">
                <div className="img_url">{/* {q.data.img} */}</div>
                <ChatBotBtn
                  questions={q.data.describes}
                  isQuestionsList={q.data.describes.length !== 0}
                  onClickQuestion={onClickQuestion}
                />
              </div>
            </div>
          ))}
      </div>
      <div className="swiper-pagination"></div>

      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>
    </div>
  );
}

ProjectSwiper.propTypes = {
  secondProjectMsg: PropsType.object,
  sendMessage: PropsType.func,
};
