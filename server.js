const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');

server.listen(process.env.PORT || 8080);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('frontpage');
})

const { v4: uuidv4 } = require('uuid');
var un, pc;

app.get('/newroom', (req, res) => {
    un = req.query.username;
    pc = req.query.passcode;
    var roomId = uuidv4();
    fs.appendFileSync("public/meeting-log.txt", roomId + ":" + pc + "\n", "utf-8");
    res.redirect(`/${roomId}`);
});

app.get('/:room', (req, res) => {
    res.render("meeting-room", {
        roomId: req.params.room,
        username: un,
    });
});
