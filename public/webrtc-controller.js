const videoGrid = document.getElementById("video-grid");

async function getMedia() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        myVideoStream = stream;
        addVideo("my-label-mini-vid", USERNAME, myVideoStream);
        changeMainVideo(stream);
    } catch (err) { }
}

getMedia();

function addVideo(labelMiniVidId, username, stream) {
    const video = document.createElement('video');
    video.className = "vid";
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    video.addEventListener('click', () => {
        changeMainVideo(stream);
    });
    const labelMiniVid = document.createElement('div');
    labelMiniVid.id = labelMiniVidId;
    labelMiniVid.className = "label-mini-vid";
    labelMiniVid.innerHTML = username;

    const miniVid = document.createElement('div');
    miniVid.className = "mini-vid";
    miniVid.append(video);
    miniVid.append(labelMiniVid);
    videoGrid.append(miniVid);


}

const mainVid = document.getElementById("main-video");

function changeMainVideo(stream) {
    mainVid.srcObject = stream;
}

const socket = io("/");
var myPeerId;
var peerList = [];
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "8080"
});

peer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id);
    myPeerId = id;
    peerList[id] = USERNAME;
});

socket.on("user-connected", (peerId) => {
    connectToOther(peerId, myVideoStream);
});

const connectToOther = (peerId, stream) => {
    const call = peer.call(peerId, stream);
    peerList[call.peer] = "";
    var i = 1;
    call.on("stream", userVideoStream => {
        if (i <= 1) {
            addVideo(call.peer, "", userVideoStream);
            var conn = peer.connect(peerId);
            conn.on("open", function () {
                conn.send(myPeerId + "_" + USERNAME);
            });
        }
        i++;
    });
}

var myVideoStream1;
peer.on("call", call => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        myVideoStream1 = stream;
        call.answer(stream);
        var conn = peer.connect(call.peer);
        conn.on("open", function () {
            conn.send(myPeerId + "_" + USERNAME);
        });
    });
    
    var i = 1;
    call.on("stream", userVideoStream => {
        if (i <= 1) {
            addVideo(call.peer, "", userVideoStream);
        }
        i++;
    });
    peerList[call.peer] = "";
});



var peerName;

peer.on('connection', function (conn) {
    conn.on('data', function (data) {
        var message = data.split("_");
        peerList[message[0]] = message[1];
        document.getElementById(message[0]).innerHTML = message[1];
    });
});
