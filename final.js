const express = require('express');
const bodyParser = require("body-parser");
const customId = require("custom-id");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const ServerKey = 3000;

var idnames = [];
var idee = [];


app.set('view engine', 'ejs');
require('dotenv').config()
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
        toid = process.env.AdminID
      }
      send_chat(from,to,fromid,toid,message,time);
      let k;
      let abc = [
        {
        "From" : from,
        "Message" : message,
        "Time" : time
        }
      ];
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
      let work = "send text";
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
        toid = process.env.AdminID
      }
      search_chat(fromid,toid).then( data => {
        io.emit("send text",data);
       
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








const {MongoClient} = require("mongodb");

const url = process.env.MongoURL;
const client = new MongoClient(url);
const dbName = "WebChat";
const dbChat = "Chatting";
const collect_IDs = "UserIDs";
const collect_connection = "Connections";


async function insertID(naam,user_ID,secret_){
  try{
      let result = await client.connect();
      let db = result.db(dbName); 
      let collection = db.collection(collect_IDs);
  
      // let query = { id: 6};
      const Account = {
        Name:naam, 
        UserIDs: user_ID, 
        SecretKey: secret_ 
      };

      const res = await collection.insertOne(Account);
      console.log("Values are Inserted!!");
      // console.log(secret_);
      add_connection(process.env.AdminID,secret_);
  }
  finally{
      await client.close();
  }
  }


async function find_friend(frie_id){    //Imported
  try{
      let result = await client.connect();
      let db = result.db(dbName); 
      let collection = db.collection(collect_IDs);

      let response = await collection.find({"SecretKey":frie_id}).toArray();
        if(response.length)
        return response[0].Name;
      else
        return 0;
  }
  finally{
      await client.close();
  }
}


async function check_connection(myid,toid){
  try{
      let result = await client.connect();
      let db = result.db(dbName); 
      let collection = db.collection(collect_connection);
  
      let query = {
        $or: [
          { 'Connection': { $regex: `^${myid}:${toid}` } },
          { 'Connection': { $regex: `^${toid}:${myid}` } }
        ]
      }; 
      let check = await collection.find(query).toArray();
      return check.length;

  }
  finally{
      await client.close();
  }
}


async function find_connection(myid){
  try{
      let result = await client.connect();
      let db = result.db(dbName); 
      let collection = db.collection(collect_connection);
  
      let query = {
        $or: [
          { 'Connection': { $regex: `^${myid}:` } },
          { 'Connection': { $regex: `:${myid}` } }
        ]
      }; 
      let Connecter = [];
      let friend = await collection.find(query).toArray();
      // let response2 = await collection.find(Endquery).toArray();
      for(let i=0;i<friend.length;i++){
        let k;
        let pusher;
        if(friend[i].FromID === myid){
          k=friend[i].ToID;

          if(k === process.env.AdminID)
          continue;

          pusher = {
            "Name" : friend[i].ToUser,
            "ID" : k
          }
        }else{
          k=friend[i].FromID;
          
          if(k === process.env.AdminID)
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
  finally{
      await client.close();
  }
}


async function add_connection(from_id,To_id){     //Imported - ADD CONNECT
  try{
      let result = await client.connect();
      let db = result.db(dbName); 
      let collection = db.collection(collect_connection);

      let from_name = await find_friend(from_id);

      let Connecter = sorter(from_id,To_id);

      let a = check_same(from_id,To_id);

      if(a==0){
        let To_name = await find_friend(To_id);
        if(To_name!=0){
        
          var Connect = {
            "FromUser": from_name,
            "FromID": from_id,
            "ToUser": To_name,
            "ToID": To_id,
            "Connection": Connecter
          };

        let check = await check_connection(from_id,To_id);
        
        if(check==0){
        await client.connect();
        let response = await collection.insertOne(Connect);
        // console.log("Connection Built in "+from_id+" & "+To_id);
        // console.log("Connection Built in "+from_name+" & "+To_name);
        // console.log(Connect);
      }
      // else
      // console.log('Already have Connection');
        }
        // else{
        //   console.log("Person don't exist!!!, wrong friend ID!!");
        // }
      }
      // else{
      //   console.log("Same ID: thats why error!!!");
      // }
  }
  finally{
      await client.close();
  }
}




//----------------For CHATTING--------------------

async function send_chat(from_name,To_name,from_id,to_id,message,time){
  try{
    let result = await client.connect();
    let db = result.db(dbChat); 
    let coll = sorter(from_id,to_id);
    let collection = db.collection(coll);
    // console.log("Sending coll"+coll);
    let mess = {
      "FromUser": from_name,
      "FromID": from_id,
      "ToUser": To_name,
      "ToID": to_id,
      "Message": message,
      "Time":time
    };  

    let response = await collection.insertOne(mess);
    // console.log("Message Sent from "+from_id+" to "+to_id);

  }
  finally{
    await client.close();
  }
}



async function search_chat(from_id,to_id){
  try{
    let result = await client.connect();
    let db = result.db(dbChat); 
    let coll = sorter(from_id,to_id);
    let collection = db.collection(coll);
    // console.log("receiveing coll"+coll);
    let ab = [];
    let response = await collection.find().toArray();
    // console.log("Search of chat is done :"+response.length);
    if(response.length){
    for(let i=0;i<response.length;i++){
      let a = response[i].FromID;
      let b = response[i].Message;
      let c = response[i].Time;

      let abc = {
        "From" : a,
        "Message" : b,
        "Time" : c
      }


      ab.push(abc);
    }
    //  console.log(ab);
    return ab;
  }
  else
  return response;
  }
  finally{
    await client.close();
  }
}













//Functionsss

function check_same(id1,ide2){
  // let a=0;
  if (id1 == ide2 ){
    return 1;
  }
  else
  return 0;
}


const customOrder = process.env.Order;

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
  
