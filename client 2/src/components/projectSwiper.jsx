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
  const isLinksList = secondProjectMsg.lists.length !== 0;

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
  const onClickLink = (q) => {
    return () => {
      // 연속 클릭 방지
      if (!clickable) return;
      clickable = false;
      setTimeout(() => {
        clickable = true;
      }, 1000);

      // 선택한 질문, client 메시지화
      sendMessage(q.q_title);
      // 요청 전달(함수 나중 실행)
      setTimeout(() => {
        sendMessage(undefined, q.id, 'bot_answer');
      }, 0);
    };
  };
  return (
    <div className="swiper bot-msg">
      <div className="swiper-wrapper">
        {isLinksList &&
          secondProjectMsg.lists.map((q, i) => (
            <div className="swiper-slide" key={i}>
              <div className="project">
                <div className="img_url">{/* {q.data.img} */}</div>
                <ChatBotBtn
                  links={q.data.links}
                  isLinksList={q.data.links.length !== 0}
                  onClickLink={onClickLink}
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
