base64toBlob = (base64Data, contentType) => {
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

    // 채팅 - welcome, chat, disconnect
    const chatform = document.querySelector('#chat');
    const chatlog = document.querySelector('#ul-chatlog');
    const message = document.querySelector('input[name="message"]');
    chatform.addEventListener('submit', (event) => {

        event.preventDefault();

        if (message.value === '') {
            return;
        }

        console.log(message.value);
        socket.emit('chat', { message: message.value });
        message.value = '';
    });
    socket.on('welcome', (data) => {
        socket.broadcast.emit('welcome', '누군가가 이 세계에 합류했습니다. 디아블로의 사도들이 더욱 강해질 것 입니다.');
    }).on('chat', (data) => {
        chatlog.appendChild(document.createElement('li')).innerHTML = `${data.sender} : ${data.message}`;
    }).on('disconnect', (data) => {
        // disconnect
    });

    // 눈 - EYE
    socket.on('eye', (data) => {
        blobData = base64toBlob(data, 'image/jpg')
        const urlCreator = window.URL || window.webkitURL
        const imageUrl = urlCreator.createObjectURL(blobData)
        image.src = imageUrl
    })
}
