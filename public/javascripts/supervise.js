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
window.onload = event => {

    const socket = io();

    /* 채팅 - welcome, chat, disconnect */
    const chatform = document.querySelector('#chat');
    const chatlog = document.querySelector('#card-chatlog');
    const message = document.querySelector('input[name="message"]');
    chatform.addEventListener('submit', (event) => { // 메시지 전송
        event.preventDefault();
        if (message.value === '') {
            return;
        }
        socket.emit('chat', message.value);
        message.value = '';
    });
    socket.on('welcome', (data) => {
        socket.broadcast.emit('welcome', '');
    }).on('chat', (data) => {
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
