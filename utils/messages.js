const moment = require('moment');

const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    }
}

const generateLocationMessage = (username, url) => {
    const date = new Date().getTime()
    return {
        username,
        url,
        createdAt: date.fromNow(),
    }
}

module.exports = {generateMessage, generateLocationMessage}