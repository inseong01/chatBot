# React + Vite 시행착오

## .env 사용법
`vercel`로 생성한 프로젝트에서 `.env`파일은 `process.env.변수명`으로 접근할 수 없다.

`vercel`에서 지원하는 방식을 사용해야 한다.
`import.meta.env.변수명`으로 모든 상황에서 접근할 수 있다.

`.env` 파일명을 달리 저장하여 원하는 `mode`에서 접근할 수 있도록 설정할 수 있다.    

예시 ) `.env.[.mode]`, `.env.development`

### 참고자료
[vercel에서 환경변수 사용하는 방법 - vercel Guide](https://ko.vitejs.dev/guide/env-and-mode)

## CORS 서버 설정
클라이언트가 `URI`가 다른 서버로 접속하기 위해 서버는 클라이언트 URI 접근을 설정해야 한다. `CORS`는 서로 다른 도메인에서 접근을 시도할 때 발생한다.    

### 해결방법 1 : 외부 라이브러리 사용 - CORS
```javascript
import cors from 'cors'

const corsMiddleware = cors({
  origin: '접근 허용할 클라이언트 URI',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

const server = http.createServer((req, res) => {
  corsMiddleware(req, res, () => {
    res.statusCode = 200;
    res.end('Hello World');
  });
});
```

### 해결방법 2 : Node.js 내장 객체 사용
외부 라이브러리가 많아지면 패키지가 무거워질 수 있다. 
따라서 `node`가 지원하는 내장 객체로 `CORS`를 해결할 수 있다.   

`.setHeader('key', 'value')` 함수로 `http 응답헤더`를 설정한다.

```javascript
http.createServer((req, res) => {
  // 모든 URI 접근 가능
  res.setHeader("Access-Control-Allow-Origin", '*');
  // 쿠키 접근 허용 여부
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // fetch 방식 허용 목록 설정
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");

  res.statusCode = 200;
  res.end('Hello World');
})
```

### socket.io-client : CORS 해결방법
`CORS`는 서버 측에서 설정한다. 클라이언트는 따로 `CORS`를 설정하지 않아도 된다. `socket.io`에서 발생하는 `CORS`문제는 서버에서 클라이언트의 `URI`를 허용하도록 설정하면 된다. 따로 라이브러리를 설치하지 않아도 된다.

```javascript
const io = new Server(httpServer, {
  // cors socket.io-client 내장 객체
  cors: {
    origin: '접근 허용할 클라이언트 URI'
  }
})
```

### 참고자료
[handling-cors - socket.io Docs](https://socket.io/docs/v4/handling-cors/)

## websocket 배포 방법
간단하게 `socket.IO-client`를 `vercel`로 배포하였다. 콘솔로그에 오류가 발생했다. 서버로 연결되지 않는 상태였다. `CORS` 문제가 아니었다. 문제는 `vercel`이 `websocket`을 지원하지 않는 것이었다.    

`vercel`은 응답/요청 구조로 되어 있다. `websocket`은 요청 없이도 응답한다. 실시간 데이터 이동을 `vercel` 프로젝트로 배포하려면 `Serverless Functions`을 사용하는 `thrid-party`를 고려해야 한다. 현재 `vercel` 대쉬보드는 `SWR`로 제작되었다.     

서버리스가 아닌 `socket.IO`는 `vercel`로 배포할 수 없다.    

### 참고자료
[websocket 미지원 - vercel Docs](https://vercel.com/docs/limits/overview#websockets)    
[socket.io 작동방식 - websocket Docs](https://socket.io/docs/v3/how-it-works/)    
[서버리스란 - datadog](https://www.datadoghq.com/knowledge-center/serverless-architecture/)   
[웹소켓 개념과 작동원리 - yuricoding](https://yuricoding.tistory.com/134)   
