module.exports = (server) => {
    const io = require('socket.io')(server);
    const db = require('../lib/db');

    const getTimestamp = () => {
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

        return `${ampm} ${h}:${m}:${s}`;
    }

    const socketIDUserMap = new Map();
    const socketIDMobileMap = new Map();
    const socketIDExamMap = new Map();

    io.on('connection', async (socket) => {

        /* socketio with desktop */
        socket.on('desktop-welcome', async (data) => {

            const client = await db.getClient();
            const userInfo = client.db().collection('users').findOne({
                accessCode: data.data.userCode
            }).then((result) => {
                socketIDUserMap.set(socket.id, result); // socket.id와 usercode, examcode를 매핑한다
            });
            await client.close();
            socketIDExamMap.set(socket.id, data.data.examCode);

        }).on('desktop-chat', async (data) => { // 채팅

            const chatData = {
                timestamp: getTimestamp(),
                sender: socketIDUserMap.get(socket.id).name,
                message: data.message
            };
            console.log(`(${chatData.timestamp}) ${chatData.sender} : ${chatData.message}`);
            io.emit('chat', chatData); // 웹에 채팅 뿌리기
            io.emit('desktop-chat', chatData); // 클라이언트들에게 채팅 뿌리기
            const client = await db.getClient();
            const chatLogs = await client.db().collection('exams').updateOne( // db에 채팅 로그 업데이트
                {
                    accessCode: socketIDExamMap.get(socket.id)
                }, {
                $addToSet: {
                    chattingLogs: {
                        timestamp: chatData.timestamp,
                        sender: chatData.sender,
                        message: chatData.message
                    }
                }
            });
            await client.close();
        });

        /* socketio with supervisor */
        socket.on('welcome', async (data) => {
            console.log(data);
            socketIDUserMap.set(socket.id, {
                name: data.name
            });
        }).on('chat', async (data) => { // TODO: .on('desktop-chat')과 완전히 동일하지만 리팩토링은 여유될때 (desktop 팀이랑 시간 맞춰야 함)
            const chatData = {
                timestamp: getTimestamp(),
                sender: socketIDUserMap.get(socket.id).name,
                message: data.message
            };
            console.log(`(${chatData.timestamp}) ${chatData.sender} : ${chatData.message}`);
            io.emit('chat', chatData); // 웹에 채팅 뿌리기
            io.emit('desktop-chat', chatData); // 클라이언트들에게 채팅 뿌리기
            const client = await db.getClient();
            const chatLogs = client.db().collection('exams').updateOne( // db에 채팅 로그 업데이트
                {
                    accessCode: socketIDExamMap.get(socket.id)
                }, {
                $addToSet: {
                    chattingLogs: {
                        timestamp: chatData.timestamp,
                        sender: chatData.sender,
                        message: chatData.message
                    }
                }
            });
            await client.close();
        }).on('disconnect', async (data) => {

        });

        /* socketio with mobile */
        socket.on('mobile-welcome', (data) => { // 접속
            console.log(`mobile-welcome: ${data}`);
            const chatData = {
                timestamp: getTimestamp(),
                sender: "mobile",
                message: "mobile-welcome"
            };
            io.emit('chat', chatData);
        }).on('request-data', (data) => { // 데이터 전송 요청
            console.log(`request-data`);
            console.log(data)
            io.emit('request-data', data);
        }).on('eye', (data) => { // 사진 데이터
            console.log(`eye`);
            socket.broadcast.emit('eye', data); // TODO: 시험 두개 동시 시작해서 각각 다른 eye 받는지 확인해야 함
        }).on('stop-data', () => { // 데이터 전송 중단 요청
            console.log(`stop-data`);
            io.emit('stop-data');
        }).on('mobile-disconnect', (data) => { // 접속 해제
            console.log(`mobile-disconnect: ${data}`);
            io.emit('request-data', data);
        });
    });
}
