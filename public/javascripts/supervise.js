// const db = require('../../lib/db'); 이거 안됨 TODO: 클라이언트 측에서 서버 DB에 연결하기 or 서버에서 여기로 정보 주기

const base64toBlob = (base64Data, contentType) => {
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(base64Data);
    let bytesLength = byteCharacters.length;
    let slicesCount = Math.ceil(bytesLength / sliceSize);
    let byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

// socket.io 관련 event
window.onload = async event => {
    
    const socket = io();

    // 참여자 목록 이벤트
    const userlist = document.querySelector('#user-list').children;
    for (let i = 0; i < userlist.length; ++i) {
        if (i % 2) { // TODO: 이벤트 리스너로 해당 유저가 welcome했는지에 따라서 색깔 다르게 표시되도록 변경
            userlist[i].firstChild.className = 'list-group-item list-group-item-danger';
        }
    }

    /* 채팅 - welcome, chat, disconnect */
    const chatform = document.querySelector('#chat');
    const message = document.querySelector('input[name="message"]');
    chatform.addEventListener('submit', (event) => { // 메시지 전송
        event.preventDefault();
        if (message.value === '') {
            return;
        }
        socket.emit('chat', {
            message: message.value
        });
        message.value = '';
    });
    const chatlog = document.querySelector('#card-chatlog');
    socket.emit('welcome', { // 웰컴 메시지로 이름 뿌리기
        name: '감독'
    });
    socket.on('chat', (data) => { // 채팅 왔을때 채팅로그에 온 채팅 추가하기
        chatlog.appendChild(createSpeechBubble(data.sender, data.message, data.timestamp));
        chatlog.scrollTop = chatlog.scrollHeight;
    }).on('disconnect', (data) => { // 연결 끊겼을때

    });

    /* mobile - 서버 측: mobile-welcome, mobile-disconnect
                클라 측: requset-data, eye, stop-data */
    for (const a of userlist) {
        a.addEventListener('click', event => {
            const name = a.innerText.match(/\((.*?)\)/);
            console.log(name);
            const userCode = a.id; // TODO: userCode 말고 email을 전송하는 거로 바꾸기
            socket.emit('stop-data'); // 전송하고 있던 디바이스한테 전송 멈추게 하고 (TODO: 딜레이 때문에 살짝 다르게 동작하는 것 고치기)
            socket.emit('request-data', { // userCode에 맞는 디바이스만 전송 시작하도록 서버에 유저코드 보냄
                type: 'RES',
                userCode: userCode
            });
        });
    }

    const image = document.querySelector('#image-eye');
    socket.on('eye', (data) => {
        blobData = base64toBlob(data, 'image/jpg');
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blobData);
        image.src = imageUrl;
    }).on('stop-data', () => {
        image.src = '/images/eye-def.jpg';
    });
}

function createSpeechBubble(sender, message, timestamp) {
    const div = document.createElement('div');
    div.className = 'px-1';
    div.innerText = `👩🏻 ${sender}`;
    div.appendChild(document.createElement('br'));

    const m = document.createElement('div');
    m.className = 'card d-inline-block ml-4 p-1';
    m.innerText = message;
    div.appendChild(m);
    div.appendChild(document.createElement('br'));

    const t = document.createElement('span');
    t.className = 'text-muted float-right';
    t.innerText = timestamp;
    div.appendChild(t);

    return div;
}
