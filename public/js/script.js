const socket = io();
var date = new Date()

const chatbody = document.getElementById("chattt");
const friendInput = document.getElementById('friend-id');
var ide = localStorage.getItem('UniqueID');
var user = localStorage.getItem('username');



socket.emit('Online I', user, ide);



friendInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    console.log("Enter key pressed");
    document.getElementById('friend-adder').click();
  }
});


    document.getElementById('UserIDD').innerHTML = 'ID : ' + ide;


    document.querySelectorAll('.fri-acc').forEach(function(element) {
        element.addEventListener('click', function() {
            chatbody.innerHTML="";
            document.querySelector('.chatbox').classList.add('showbox');
            var name = element.querySelector('div > h3').innerHTML;
            document.querySelector('.prof-acc').querySelector('div > h3').innerHTML = name;
            var position = element.querySelector('div > p').innerHTML;
            document.querySelector('.prof-acc').querySelector('div > p').innerHTML = position;
            position = position.replace("ID : ", "");
            socket.emit('get chat', ide, position);
        });
    });

    document.getElementById('friend-adder').addEventListener('click', function(event) {
        var friend_id = document.getElementById('friend-id').value;
        let time = give_me_time();
        socket.emit('Add_Connection', ide, friend_id, time);
        // alert(time);
        console.log("Socket Sent");
        console.log(friend_id);
        document.querySelector("#authentication-modal button[data-modal-hide='authentication-modal']").click();
    });

    document.getElementById('friend-adder').addEventListener('keydown', function(event) {
        if(event.key === 'Enter'){
        var friend_id = document.getElementById('friend-id').value;
        let time = give_me_time();
        socket.emit('Add_Connection', ide, friend_id, time);
        // alert(time);
        console.log("Socket Sent");
        console.log(friend_id);
        document.querySelector("#authentication-modal button[data-modal-hide='authentication-modal']").click();
        }   
    });

    document.querySelectorAll('.chat-icon').forEach(function(icon) {
        icon.addEventListener('click', function() {
            document.querySelector('.chatbox').classList.remove('showbox');
        });
    });

    document.querySelectorAll('.chat-icon').forEach(function(icon) {
        icon.addEventListener('click', function() {
            document.querySelector('.chatbox').classList.remove('showbox');
        });
    });




const messa = document.getElementById('messenger');


document.getElementById('sender').addEventListener('click', function(event) {
    let message = messa.value;
    let time = give_me_time();
    let from = user;
    let to = document.querySelector('.prof-acc').querySelector('div > h3').innerHTML;
    let fromid = ide;
    let toid = document.querySelector('.prof-acc').querySelector('div > p').innerHTML ;
    toid = toid.replace("ID : ", "");
    messa.value="";
    socket.emit('private message', from,to,fromid,toid,message, time);
    console.log("From :"+from);
    console.log("To :"+to);
    console.log("Message :"+message);
    console.log("Time :"+time);
    addchat("repaly",message,time);
});


document.getElementById('sender').addEventListener('keydown', function(event) {
    if(event.key === 'Enter'){
    let message = messa.value;
    let time = give_me_time();
    let from = user;
    let to = document.querySelector('.prof-acc').querySelector('div > h3').innerHTML;
    let fromid = ide;
    let toid = document.querySelector('.prof-acc').querySelector('div > p').innerHTML ;
    toid = toid.replace("ID : ", "");
    messa.value="";
    socket.emit('private message', from,to,fromid,toid,message, time);
    console.log("From :"+from);
    console.log("To :"+to);
    console.log("Message :"+message);
    console.log("Time :"+time);
    addchat("repaly",message,time);
    }
});

messa.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      console.log("Enter key pressed");
      document.getElementById('sender').click();
    }
  });


 

  function addchat(classi,message,time) {


    const listItem = document.createElement('li');
    listItem.className = classi;

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'time';
    timestampSpan.textContent = time;

    listItem.appendChild(messageParagraph);
    listItem.appendChild(timestampSpan);

    chatbody.appendChild(listItem);
    // chatbody.scrollTop = chatbody.scrollHeight;
  }


function give_me_time() {
    let hours = date.getHours();
    let slot;
    if(hours>12){
    hours = hours-12;
    slot = "pm";
    }else{
    slot="am";
    }
    let minutes=date.getMinutes();
    if(minutes<10){
        minutes='0'+minutes;
    }
    let time = hours+":"+minutes+" "+slot;

    return time;
}


socket.on("send text",(data) => {
    let n = data.length;
    let clas;
    for(let i=0;i<n;i++){
        if(data[i]["From"]===ide)
        clas = "repaly";
        else
        clas = "sender";
        console.log("its working");
        addchat(clas,data[i].Message,data[i].Time); 
        // scrollToBottom();
    };
});    

socket.on("curr text",(data) => {
    let sender = data.From;
    let mess = data.Message;
    let time = data.Time;
    let in_chat = document.querySelector('.prof-acc').querySelector('div > h3').innerHTML;
    // in_chat = in_chat.replace("ID : ", "");
    console.log(in_chat+" "+sender);
    if(sender === in_chat){
        addchat("sender",mess,time);
    }
});

socket.on("get connect",(naam,Id) => {
    create_connection(naam, Id)
});


function create_connection(Name, ID){
    // Create the 'a' element
const anchorElement = document.createElement("a");
anchorElement.href = "#";
anchorElement.className = "d-flex align-items-center fri-acc";

// Create the 'div' element for the image
const imageDiv = document.createElement("div");
imageDiv.className = "flex-shrink-0";

// Create the 'img' element
const imageElement = document.createElement("img");
imageElement.className = "img-fluid";
imageElement.src = "https://mehedihtml.com/chatbox/assets/img/user.png";
imageElement.alt = "user img";

// Append the 'img' element to the 'div' element
imageDiv.appendChild(imageElement);

// Create the 'div' element for text content
const textDiv = document.createElement("div");
textDiv.className = "flex-grow-1 ms-3";

// Create 'h3' element for the name
const nameElement = document.createElement("h3");
nameElement.textContent = Name;

// Create 'p' element for the role
const roleElement = document.createElement("p");
roleElement.textContent = "ID : "+ID;

// Append the 'h3' and 'p' elements to the 'div' element
textDiv.appendChild(nameElement);
textDiv.appendChild(roleElement);

// Append the 'div' elements to the 'a' element
anchorElement.appendChild(imageDiv);
anchorElement.appendChild(textDiv);

// Append the 'a' element to the document body or any desired container
let chatt = document.getElementsByClassName("chat-list")
chatt.appendChild(anchorElement);

}