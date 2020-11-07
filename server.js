
const express = require('express')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const {v4:uuidv4} = require('uuid')
const { ExpressPeerServer } = require('peer')

const peerServer = ExpressPeerServer(server,{
    debug:true
})

app.use('/peerjs', peerServer);

app.use(express.static('public'))
app.set('view engine','ejs');

app.get('/',(req , res)=>{
    res.redirect(`/${uuidv4()}`)
})


app.get('/:room',(req , res )=>{
    
    res.render('room',{roomId:req.params.room})
    
})


io.on('connection',(socket)=>{

    socket.on('join_room',(roomId,userId)=>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected: ',userId);


        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        }); 
      
          socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
          })
        

    })
})


const PORT  = process.env.PORT || 3000 
server.listen(PORT , ()=>{
    console.log(`the port no is ${PORT}`)
})
