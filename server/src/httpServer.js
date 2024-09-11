import { createServer } from 'http';

// node 내장 localhost 서버 생성
export const httpServer = createServer((req, res) => {
  res.statusCode = 200;
  res.end('Hello World');
})