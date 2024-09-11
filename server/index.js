import { Server } from 'socket.io';
import { httpServer } from './src/httpServer.js';

const PORT = 1234;
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('Hello Socket', socket.handshake.headers.origin);

  socket.emit('foo', socket)
});

httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));
