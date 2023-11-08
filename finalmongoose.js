const express = require('express');
const bodyParser = require("body-parser");
const customId = require("custom-id");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ServerKey = 3000;

var idnames = [];     //IDS with their socketiD
var idee = [];        //Ids Active


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/chat', (req, res) => {
  var uniqueID = customId({
    randomLength: 2
  });
  // io.emit('Custom-key',uniqueID);
  res.render('pages/startpage',{
    Unique : uniqueID 
  });
});

app.post('/', (req, res) => {
  // var name = req.body.user;
  res.redirect('/');
});

app.get('/',(req,res) => {
  res.redirect('/chat');
});


app.get('/chat/:id/:harsh', (req,res) => {

  var hp = req.params.harsh;
  var ide = req.params.id;

if((hp=="")||(ide==""))
res.redirect('/chat');

  find_connection(ide).then(friend => {
    // console.log(friend);
        res.render('pages/index', {
            NAME : friend,
            naam: hp,
            check: ide
          } );
  })    
});


//Socket Connections

io.on('connection', (socket) => {

  // console.log('Finaly worked :'+ socket.id +' user connected');
  socket.on('makeid', (naam,userID,secret) => {
    // console.log(naam+" "+userID+" "+secret);
    insertID(naam,userID,secret);
  });

  socket.on('Online I', (user, id) => {
    let active = {
      "Name": user,
      "ID": id,
      "Socket":socket.id
    }
    idnames.push(active);
    idee.push(id);
    // console.log(idnames);
    // console.log(idee);
});


  socket.on('Add_Connection', (fromid, toid) => {
    // console.log("From : "+fromid+" , To : "+toid);
    add_connection(fromid,toid);
  });


  socket.on("private message",(from,to,fromid,toid,message,time) => {
      // console.log("From :"+from);
      // console.log("To :"+to);
      // console.log("Message :"+message);
      // console.log("Time :"+time);
      // console.log(fromid+" : "+toid);
      if(toid==="Back End Developer"){
        toid = "HP212003"
      }
      send_chat(from,to,fromid,toid,message,time);
      let k;
      // let abc = [
      //   {
      //   "From" : from,
      //   "Message" : message,
      //   "Time" : time
      //   }
      // ];
      let abc ={
        "From" : from,
        "Message" : message,
        "Time" : time
        };


      // console.log(idnames);
      // if(idee.includes(toid)){
      //   for(let i=0;i<idnames.length;i++){
      //     if(idnames[i]["ID"] === toid){
      //       // console.log(idnames[i].Socket);
      //       k = idnames[i].Socket;
      //       io.to(k).emit("send text", abc);
      //     }
      //   }
      // }
      let work = "curr text";
      socket_worker(work,toid,abc)
      // console.log(k);
  });

  socket.on("get chat",(fromid,toid) => {
      // console.log("From :"+from);
      // console.log("To :"+to);
      // console.log("Message :"+message);
      // console.log("Time :"+time);
      // console.log(fromid+" : "+toid);
      if(toid==="Back End Developer"){
        toid = "HP212003"
      }
      search_chat(fromid,toid).then( data => {
        // let data = formater_chat(abcd);
        console.log("Chat data :"+data.length);
        let ab = [];
        for(let i=0;i<data.length;i++){
            let a = data[i].FromID;
            let b = data[i].Message;
            let c = data[i].Time;
            let abc = {
              "From" : a,
              "Message" : b,
              "Time" : c
            }
      
            // console.log(ab); 
            ab.push(abc);
          }
        io.emit("send text",ab);
       
      });
      // console.log(ab);
  });


  socket.on('disconnect', () => {
      console.log("Disconnecttttt :"+socket.id);
      for (let i = 0; i < idnames.length; i++) {
        if((idnames[i]["Socket"] == socket.id)){
        let k = idnames[i].ID; 
        if(idee.includes(k))
        arrayRemove(idee,k);

        idnames.splice(i,1);
        break;
        }
      }
    });
});


app.post('/',(req,res) => {
  console.log("Posttt");
});










//Mongoosee

//Build connection
const mongoose = require('mongoose');
const WebChat = mongoose.createConnection('mongodb://127.0.0.1:27017/WebChat');
const Chatting = mongoose.createConnection('mongodb://127.0.0.1:27017/Chatting');



//Schema        //Namme = Collection name, Cat used for adding in that collection
const ID_create = WebChat.model('UserIDs', { Name: String , UserIDs: Number, SecretKey: String });
const Connection = WebChat.model('Connections', { FromUser: String ,FromID: String ,ToUser: String , ToID: String, Connection: String  });


function insertID(naam,user_ID,secret_){
    let data = new ID_create({ Name: naam, UserIDs: user_ID,  SecretKey: secret_});
    data.save().then(() => console.log("Values Inserted!!!"));
}

async function find_friend(frie_id) {
    let person = await ID_create.find({"SecretKey":frie_id}, 'Name');
    if(person.length==0)
    return 0;
    else
    return person[0].Name;
}

async function check_connection(myid,toid){
    let query = {
        $or: [
          { 'Connection': { $regex: `^${myid}:${toid}` } },
          { 'Connection': { $regex: `^${toid}:${myid}` } }
        ]
      }; 
    let person = await Connection.find(query, '');
    return person.length;
}

async function find_connection(myid){
    let query = {
        $or: [
          { 'Connection': { $regex: `^${myid}:` } },
          { 'Connection': { $regex: `:${myid}` } }
        ]
      }; 
    let Connecter = [];  
    let friend = await Connection.find(query);
    for(let i=0;i<friend.length;i++){
        let k;
        let pusher;
        if(friend[i].FromID === myid){
          k=friend[i].ToID;

          if(k === "HP212003")
          continue;

          pusher = {
            "Name" : friend[i].ToUser,
            "ID" : k
          }
        }else{
          k=friend[i].FromID;
          
          if(k === "HP212003")
          continue;

          pusher = {
            "Name" : friend[i].FromUser,
            "ID" : k
          }
        }
  
        Connecter.push(pusher);
      }

    return Connecter;  
}

async function add_connection(from_id,To_id){
    let from_name = await find_friend(from_id);
    let Connecter = sorter(from_id,To_id);

    let a = check_same(from_id,To_id);

    if(a==0){
        let To_name = await find_friend(To_id);
        if(To_name!=0){
            let data = new Connection({
                FromUser: from_name, FromID: from_id, ToUser: To_name, ToID: To_id, Connection: Connecter
            });

            let check = await check_connection(from_id,To_id);

            if(check==0)
            data.save().then(() => console.log('Connection Data Inserted!!!'));

        }
    }
}



//----------------For CHATTING--------------------
const Chattemplate = Chatting.model('Chat', {
    FromUser: String,
    FromID: String,
    ToUser: String,
    ToID: String,
    Message: String,
    Time: String
  });

function send_chat(from_name,To_name,from_id,to_id,message,time){
    // Chatting.connect('mongodb://127.0.0.1:27017/Chatting');
    let coll = sorter(from_id,to_id);
    // let Chattemplate = Chatting.model(coll, { FromUser: String ,FromID: String ,ToUser: String , ToID: String, Message: String ,Time: String  });
    let ChatModel = Chatting.model(coll, Chattemplate.schema);
    let chat = new ChatModel({ FromUser:from_name, FromID:from_id, ToUser:To_name, ToID:to_id, Message: message, Time:time });
    chat.save().then(() => console.log(' Messageee Sentt!!!'));
}

async function search_chat(from_id,to_id){
    // Chatting.connect('mongodb://127.0.0.1:27017/Chatting');
    let coll = sorter(from_id,to_id);
    // let Chattemplate = Chatting.model(coll, { FromUser: String ,FromID: String ,ToUser: String , ToID: String, Message: String ,Time: String  });
    let ChatModel = Chatting.model(coll, Chattemplate.schema);
    let response = ChatModel.find({});
    // let ab = [];
    // if(response.length>0){
    //     for(let i=0;i<response.length;i++){
    //       let a = response[i].FromID;
    //       let b = response[i].Message;
    //       let c = response[i].Time;
    //       let abc = {
    //         "From" : a,
    //         "Message" : b,
    //         "Time" : c
    //       }
    
    //       console.log(ab);
    //       ab.push(abc);
    //     }
    //     return ab;
    // }
    // else
    return response;
}










// function formater_chat(response){
//     let ab = [];
//     for(let i=0;i<response.length;i++){
//         let a = response[i].FromID;
//         let b = response[i].Message;
//         let c = response[i].Time;
//         let ab = [];
//         let abc = {
//           "From" : a,
//           "Message" : b,
//           "Time" : c
//         }
  
//         console.log(ab);
//         ab.push(abc);
//       }
//       return ab;
// }



function check_same(id1,ide2){
    // let a=0;
    if (id1 == ide2 ){
      return 1;
    }
    else
    return 0;
  }
  
  
  const customOrder = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  function sorter(one,two){
      let result;
      for (let i = 0; i < Math.min(one.length, two.length); i++) {
              let charA = one[i];
              let charB = two[i];
              let indexA = customOrder.indexOf(charA);
              let indexB = customOrder.indexOf(charB);
              if (indexA !== indexB) {
                result = Math.min(indexA,indexB);
                result = indexA < indexB ? one+":"+two : two+":"+one ;
                break;
          }
      }
  return result;
  }
  
  function arrayRemove(arr, value) {
   
    return arr.filter(function (geeks) {
        return geeks != value;
    });
  
  }
  
  function socket_worker(work,To,data){
    if(idee.includes(To)){
      let n = idnames.length;
      for(let i=0;i<n;i++){
        if(idnames[i]["ID"] === To){
          // console.log(idnames[i].Socket);
          k = idnames[i].Socket;
          io.to(k).emit(work, data);
        }
      }
    }
  }
  



server.listen(ServerKey,()=>{
    console.log("Server at port ",ServerKey," !!!");
  }); 
  
