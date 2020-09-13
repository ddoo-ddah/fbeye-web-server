const answer = document.querySelector('#answer-format');

const radioShort = document.querySelector('#short');
const radioMulti = document.querySelector('#multi-selection');

document.querySelector('#short').onclick = () => { // 주관식 선택
    answer.innerHTML = `
    <div id="short-answer" class="">
    <label for="answer">답</label>
    <textarea class="form-control" id="answer" name="answer" required></textarea>
    </div>`;
}

document.querySelector('#multi-selection').onclick = () => { // 객관식 선택
    answer.innerHTML =  `
    <div id="multiple-answer">
    <p>보기</p>
    <label for="answer2">1 (<input type="checkbox" id="correct1" name="correct"><label for="correct1">정답</label>)</label>
    <textarea class="form-control" id="answer2" name="answer" rows="1" style="resize: none;" required></textarea><br>
    <label for="answer2">2 (<input type="checkbox" id="correct2" name="correct"><label for="correct2">정답</label>)</label>
    <textarea class="form-control" id="answer2" name="answer" rows="1" style="resize: none;" required></textarea><br>
    <label for="answer3">3 (<input type="checkbox" id="correct3" name="correct"><label for="correct3">정답</label>)</label>
    <textarea class="form-control" id="answer3" name="answer" rows="1" style="resize: none;"></textarea><br>
    <label for="answer4">4 (<input type="checkbox" id="correct4" name="correct"><label for="correct4">정답</label>)</label>
    <textarea class="form-control" id="answer4" name="answer" rows="1" style="resize: none;"></textarea><br>
    <label for="answer5">5 (<input type="checkbox" id="correct5" name="correct"><label for="correct5">정답</label>)</label>
    <textarea class="form-control" id="answer5" name="answer" rows="1" style="resize: none;"></textarea>
    </div>`;
}
