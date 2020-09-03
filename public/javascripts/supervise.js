// const db = require('../../lib/db'); 이거 안됨 TODO: 클라이언트 측에서 서버 DB에 연결하는 법

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

    const userlist = document.querySelector('#user-list').children;
    console.log(userlist);
    // const client = await db.getClient();
    // const users = await client.db().collection('users').find({ DB 사용 안됨
    //     _id: { $in: exam.users }
    // }).toArray();
    for (let i = 0; i < userlist.length; ++i) { // todo: welcome했는지에 따라서 색깔 다르게 표시되도록 변경
        if (i % 2) {
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
        socket.emit('chat', message.value);
        message.value = '';
    });
    const chatlog = document.querySelector('#card-chatlog');
    const socket = io();
    socket.emit('welcome', { // 입장할 때 이름 주기
        
    });
    socket.on('chat', (data) => {
        chatlog.appendChild(createSpeechBubble(data.sender, data.message, data.timestamp));
        chatlog.scrollTop = chatlog.scrollHeight;
    }).on('disconnect', (data) => {

    });

    socket.on('eye', (data) => {
        blobData = base64toBlob(data, 'image/jpg');
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blobData);
        image.src = imageUrl;
    });
}

function createSpeechBubble(sender, message, timestamp) {
    const div = document.createElement('div');
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
