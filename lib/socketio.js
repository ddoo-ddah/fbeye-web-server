module.exports = (server) => {
    const io = require('socket.io')(server);
    const db = require('./db');

    io.on('connection', async (socket) => {
        let socketIDUserMap = new Map();

        const parsedUrl = socket.request.headers.referer.split('/');
        const examCode = parsedUrl[parsedUrl.length - 1];

        socket.on('chat', async (data) => { // 채팅
            const time = new Date();
            let h = time.getHours();
            let m = time.getMinutes();
            let s = time.getSeconds();
            let ampm = h < 12 ? '오전' : '오후';
            h = h % 12;
            h = h ? h : 12; // 0시를 12시라고 표시하기
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            const chatData = {
                timestamp: `${ampm} ${h}:${m}:${s}`,
                content: `${socket.id}: ${data}`
            };
            io.emit('chat', chatData); // 클라이언트들에게 채팅 돌리기
            const client = await db.getClient();
            const chatLogs = client.db().collection('exams').updateOne( // db에 채팅 로그 업데이트
                {
                    accessCode: examCode
                }, {
                $addToSet: {
                    chattingLogs: {
                        timestamp: chatData.timestamp,
                        content: chatData.content
                    }
                }
            });
            await client.close();
        }).on('welcome', async (data) => {
            const users = await client.db().collection('users').find({
                _id: { $in: exam.users }
            }).toArray();
            socketIDUserMap.set(socket.id, users[0]); // TODO: socket.id랑 db에서 찾은 유저명 mapping하기 - 임시로 users[0] 해 둠
        }).on('disconnect', (data) => {

        });

        socket.on('eye', (data) => { // 영상 데이터
            socket.broadcast.emit('eye', data); // TODO: broadcast로 하지 말고 시험 정보에 맞게 뿌려야 함
        })
    });
}
