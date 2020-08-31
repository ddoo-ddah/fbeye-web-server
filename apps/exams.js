const db = require('../lib/db');

function getExams(email) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        const doc = await client.db().collection('admin').findOne({ // 관리자 계정 정보 가져오기
            email
        });

        const exams = doc.exams ? (
            await client.db().collection('exams').find({ // 연결된 시험 정보 가져오기
                _id: {
                    $in: doc.exams
                }
            }).toArray()
        ) : [];
        await client.close();

        if (exams) {
            resolve(exams);
        } else {
            reject(new Error('Failed to get exams.'));
        }
    });
}

function getExamInformation(accessCode) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        const doc = await client.db().collection('exams').findOne({ // 시험 정보
            accessCode
        });
        if (!doc.questions) {
            doc.questions = [];
        }

        doc.users = doc.users ? ( // 응시자 정보
            await client.db().collection('users').find({
                _id: {
                    $in: doc.users
                }
            }, {
                _id: false,
                email: true,
                name: true,
                accessCode: true
            }).toArray()
        ) : [];
        await client.close();

        if (doc) {
            resolve(doc);
        } else {
            reject(new Error('Failed to get exam information.'));
        }
    });
}

async function addExam(exam, email) {
    exam.status = 0;

    const client = await db.connect();
    const result = await client.db().collection('exams').insertOne(exam); // 시험 생성

    await client.db().collection('admin').updateOne({ // 관리자 계정에 연결
        email
    }, {
        $addToSet: {
            exams: result.insertedId
        }
    });
    await client.close();
}

function removeExam(accessCode, email) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        const doc = await client.db().collection('exams').findOne({
            accessCode
        });

        const result1 = await client.db().collection('exams').deleteOne({
            _id: doc._id
        });

        const result2 = await client.db().collection('admin').updateOne({
            email
        }, {
            $pull: {
                exams: examObjectId._id
            }
        });
        await client.close();

        if (result1 && result2) {
            resolve((result1.deletedCount === 1) && (result2.deletedCount === 1));
        } else {
            reject(new Error('Failed to remove exam.'));
        }
    });
}

function getQuestions(accessCode) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        const doc = await client.db().collection('exams').findOne({
            accessCode
        });
        await client.close();

        if (doc) {
            resolve(doc.questions ? doc.questions : []);
        } else {
            reject(new Error('Failed to get questions.'));
        }
    });
}

async function addQuestion(accessCode, question) {
    question._id = new db.objectId();

    const client = await db.connect();
    await client.db().collection('exams').updateOne({
        accessCode
    }, {
        $addToSet: {
            questions: question
        }
    });
}

module.exports = {
    getExams, getExamInformation, addExam, removeExam, getQuestions, addQuestion
};
