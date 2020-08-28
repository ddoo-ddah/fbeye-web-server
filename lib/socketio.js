module.exports = (server) => {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        
        socket.on('chat', (data) => { // 채팅
            io.emit('chat', data);
        }).on('welcome', () => {
            
        }).on('disconnect', () => {

        });
        
        socket.on('eye', (data) => { // 영상 데이터
            socket.broadcast.emit('eye', data); // TODO: broadcast가 아닌 시험 정보에 맞게 뿌려야 함
        })
    });
}
