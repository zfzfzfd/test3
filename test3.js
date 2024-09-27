const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');

const app = express();

const port = 3000;

const server = http.createServer(app);
const io = socketIO(server);

// EJS를 뷰 엔진으로 설정
app.set('view engine', 'ejs');




const cnn = mysql.createConnection({
        host: '192.168.0.100',
        user: 'newuser1',
        password: '1234',
        database: 'data'
    });

    cnn.connect(err => {
        if (err) {
            console.error('MySQL 연결 실패:', err.code, err.message);
        } else {
            console.log('MySQL 연결 성공');
        }
    });

    cnn.on('error', err => {
        console.error('MySQL 오류:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // 연결이 끊어지면 재연결
        } else {
            throw err;
        }
    });



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true
}));

// Socket.IO 연결 처리
io.on('connection', (socket) => {
    console.log('A user connected');

    // 클라이언트에 초기 데이터 전송
    notifyClients();

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// 클라이언트에 데이터 전송
function notifyClients() {
    if (!cnn) {
        console.error('데이터베이스 연결이 없습니다.');
        return;
    }

    const sql = 'SELECT * FROM sensor_readins ORDER BY timestamp DESC LIMIT 1';
    cnn.query(sql, (err, result) => {
        if (err) {
            console.error('쿼리 실행 오류:', err);
            return;
        }
        if (result.length > 0) {
            const latestData = result[0];
            io.emit('update', { heartSensor: latestData.Heart_s });
        }
    });
}

// 1초마다 데이터베이스에서 데이터 조회
setInterval(notifyClients, 1000);

app.get('/', (req, res) => {
    res.render('test3'); // ./views/test3.ejs를 불러오기
});

server.listen(port, () => {
    console.log(`서버 실행중. http://localhost:${port}`);
});