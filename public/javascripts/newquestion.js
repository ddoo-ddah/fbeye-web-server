const answer = document.querySelector('#answer-format');

const radioShort = document.querySelector('#short');
const radioMulti = document.querySelector('#multi-selection');

document.querySelector('#short').onclick = () => { // 주관식 선택
    document.querySelector('#short-answer').className = '';
    document.querySelector('#multiple-answer').className = 'invisible';
    document.querySelector('#short-answer').style.height = '0%';
    document.querySelector('#multiple-answer').style.height = '100%';
}

document.querySelector('#multi-selection').onclick = () => { // 객관식 선택
    document.querySelector('#short-answer').className = 'invisible';
    document.querySelector('#multiple-answer').className = '';
    document.querySelector('#short-answer').style.height = '100%';
    document.querySelector('#multiple-answer').style.height = '0%';
}
