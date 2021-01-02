const AWS = require('aws-sdk');
const lexruntime = new AWS.LexRuntime();


exports.handler = async (event) => {

    if (event.httpMethod === "POST") {
        let reply = await sendToLex(event);
        return done(reply);
    }
};

const sendToLex = async event => {
    console.log('event', event);
    let messageForLex = mapMessageToLex(event.body);

    let lexPromise = new Promise((resolve, reject) => {
        lexruntime.postText(messageForLex, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });

    let [err, resp] = await lexPromise;
    if (err) {
        return { err }
    }
    console.log('lex response', resp);
    return { res: resp.message }
}

const mapMessageToLex = message => {
    return {
        botAlias: 'prod',
        botName: 'shoppingBot',
        inputText: message.text,
        userId: message.sessionID,
        sessionAttributes: {}
    };
}

const done = ({ err, res }) => {
    console.log('res', res);
    console.log('error', err);
    return {
        statusCode: err ? '404' : res !== [] ? '200' : '204',
        body: err ? JSON.stringify({ error: err || 'there was an error' }) : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*'
        },
    };
}