_ = {};

const socketio = require('socket.io');

_.createSocketIO = (server) => {
    io = socketio.listen(server);

    io.on("connection", function(socket) {
    /* 연습정보 상세정보 입장 */
    socket.on("join", function(data) {
        socket.join(data);
        return socket.room = data;
    });
    
    /* 연습정보 목록 입장 */
    socket.on("hallJoin", function() {
        return socket.join("hall");
    });
    
    /* 연습곡 정보 갱신 */
    socket.on("refreshWorshipTitle", function(data) {
        io.sockets["in"]("hall").emit("refreshPage", "예배 정보가 갱신되었습니다.");
        return io.sockets["in"](socket.room).emit("refreshWorshipTitle", data);
    });
    
    /* 메모 갱신 */
    socket.on("refreshWorshipMessage", function(data) {
        io.sockets["in"]("hall").emit("refreshPage", "공지사항이 등록 되었습니다.");
        return io.sockets["in"](socket.room).emit("refreshWorshipMessage", data);
    });
    
    /* 메모 갱신 */
    socket.on("refreshReport", function(data) {
        io.sockets["in"]("hall").emit("refreshPage", "교사보고서 내용이 변경 되었습니다.");
        return io.sockets["in"](socket.room).emit("refreshReport", data);
    });
    
    /* 출석 체크 */
    return socket.on("select", function(data) {
        console.log("select Client Send Data:", data);
        return io.sockets["in"](socket.room).emit("select", data);
    });
    });
}

module.exports = _