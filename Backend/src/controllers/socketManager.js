import { Server } from "socket.io"



let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("something connected");

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if (messages[path] == !undefined) {
                for (let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender']
                    )
                }
            }

        });


        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {

                        return [roomKey, true];
                    }

                    return [room, isFound];
                }, ["", false]);

            if (found) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, 'data': data, "socket-id-sender": socket.id })
                console.log("messages", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach(elem => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {

            let diffTime = Math.abs(timeOnline[socket.id] - new Date());

            let key;

            // for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){}   // this takes substantial CPU memory
            let Connections = structuredClone(Object.entries(connections));
            for (const [k, v] of Connections) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        let index = connections[key].indexOf(socket.id);

                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        })
    })

    return io;
}




// let connections = new Map();
// let messages = new Map();
// let timeOnline = new Map();


// export const connectToSocket = (server) => {
//     const io = new Server(server);

//     io.on("connection", (socket) => {

//         socket.on("join-call", (path) => {
//             if (!connections.has(path)) {
//                 connections.set(path, []);
//             }

//             let connectionPath = connections.get(path);
//             let messagePath = messages.get(path);

//             connectionPath.push(socket.id);

//             timeOnline.set(socket.id, new Date());

//             socket.join(path);

//             io.to(path).emit("user-joined", socket.id, connections.get(path))

//             if (messages.has(path)) {
//                 for (let a = 0; a < messagePath.length; ++a) {
//                     io.to(socket.id).emit("chat-message", messagePath[a]['data'],
//                         messagePath[a]['sender'], messagePath[a]['socket-id-sender']);
//                 }
//             }

//         });

//         socket.on("signal", (toId, message) => {
//             io.to(toId).emit("signal", socket.id, message);
//         });

//         socket.on("chat-message", (data, sender) => {
//             let matchingRoom = "";
//             let found = false;

//             for (const [roomKey, roomValue] of connections) {

//                 if (roomValue.includes(socket.id)) {
//                     found = true;
//                     matchingRoom = roomKey;

//                     break;
//                 }
//             }

//             if (found) {
//                 if (!messages.has(matchingRoom)) {
//                     messages.set(matchingRoom, [])
//                 }

//                 messages.get(matchingRoom).push({
//                     'sender': sender,
//                     'data': data,
//                     "socket-id-sender": socket.id
//                 });

//                 io.to(matchingRoom).emit("chat-message", data, sender, socket.id);
//             }
//         })

//         socket.on("disconnect", () => {
//             let diffTime = Math.abs(timeOnline.get(socket.id) - new Date);

//             let Connections = structuredClone(connections);

//             for (const [roomPath, socketArray] of Connections) {

//                 let index = socketArray.indexOf(socket.id);

//                 if (index !== -1) {

//                     io.to(roomPath).emit("user-left", socket.id);

//                     socketArray.splice(index, 1);

//                     if (socketArray.length === 0) {
//                         connections.delete(roomPath);
//                     }

//                     break;
//                 }
//             }
//         });
//     })
