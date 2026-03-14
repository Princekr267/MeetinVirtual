import { Server } from "socket.io"

let connection = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED:", socket.id);

        socket.on("join-call", (path) => {
            if (connection[path] === undefined) {
                connection[path] = [];
            }
            connection[path].push(socket.id);
            
            timeOnline[socket.id] = new Date();

            connection[path].forEach((clientId) => {
                io.to(clientId).emit("user-joined", socket.id, connection[path]);
            });
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const matchingRoom = Object.keys(connection).find((room) => 
                connection[room].includes(socket.id)
            );

            if (matchingRoom) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                
                messages[matchingRoom].push({
                    "sender": sender, 
                    "data": data, 
                    "socket-id-sender": socket.id
                });
                
                console.log("messages", matchingRoom, ": ", sender, data);

                connection[matchingRoom].forEach((clientId) => {
                    io.to(clientId).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            const diffTime = Math.abs(timeOnline[socket.id] - new Date());
            
            // Clean up timeOnline mapping
            delete timeOnline[socket.id];

            const matchingRoom = Object.keys(connection).find((room) => 
                connection[room].includes(socket.id)
            );

            if (matchingRoom) {
                // Notify remaining users in the room
                connection[matchingRoom].forEach((clientId) => {
                    if (clientId !== socket.id) {
                        io.to(clientId).emit("user-left", socket.id);
                    }
                });

                // Remove user from the room
                connection[matchingRoom] = connection[matchingRoom].filter(id => id !== socket.id);

                // Clean up the room if empty
                if (connection[matchingRoom].length === 0) {
                    delete connection[matchingRoom];
                }
            }
        });
    });

    return io;
}