const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var employees = [];
let id_counter = 0;

const { ENGINE_METHOD_PKEY_ASN1_METHS } = require('constants');

app.use('/style', express.static(__dirname + '/style'));
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', (socket) => {
    console.log('new user');
    socket.emit('get_server_data', employees);
    socket.on('add_emp', () => {
        var today = new Date();
        var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
        var emp = get_emp(++id_counter, '', '', '', '', date, [false, false, false, false, false]);
        employees.push(emp);
        io.emit('added_emp', emp);
    });
    socket.on('delete_emp', (id) => {
        const index = employees.findIndex((el) => el.id == id);
        if (index >= 0) {
            employees.splice(index, 1);
            io.emit('deleted_emp', id);
        }
        else console.log('Элемент с id = ' + id + ' не найден');
    });
    socket.on("onfocus", (id, col) => {
        const index = employees.findIndex((el) => el.id == id);
        if (index >= 0) {
            employees[index][col].isediting = true;
            socket.broadcast.emit("onfocused", id, col);
        }
        else console.log('Элемент с id = ' + id + ' не найден');
    });
    socket.on("onblur", (id, col) => {
        const index = employees.findIndex((el) => el.id == id);
        if (index >= 0) {
            employees[index][col].isediting = false;
            socket.broadcast.emit("onblured", id, col);
        }
        else console.log('Элемент с id = ' + id + ' не найден');
    });
    socket.on('onpropertychange', (key, id, value) => {
        const index = employees.findIndex((el) => el.id == id);
        if (index >= 0) {
            employees[index][key][key] = value;
            io.emit('propertychanged', key, id, value);
            if (key == 'status' || key == 'employment_date') {
                socket.emit('blur_element');
            }
        }
        else console.log('Элемента с id = ' + id + ' не найден');
    });
});

function get_emp(id, name, position, salary, status, employment_date, iseditings ) {
    return {
        id: id,
        name: {
            name: name,
            isediting: iseditings[0],
        },
        position: {
            position: position,
            isediting: iseditings[1]
        },
        salary: {
            salary: salary,
            isediting: iseditings[2]
        },
        status: {
            status: status,
            isediting: iseditings[3]
        },
        employment_date: {
            employment_date: employment_date,
            isediting: iseditings[4]
        }
    }
}

http.listen(port, () => console.log('listening on port ' + port));
