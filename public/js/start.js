
const socket = io();
console.log("Script is running");
window.onload = function() {
    var username = window.localStorage.getItem('username');
    var userid = window.localStorage.getItem('UniqueID');
    var secret = window.localStorage.getItem('secret');
    if (username)  {
      // console.log(username);
    //     // var redirect = '/chat/'+UniqueID+'/'+username;
        window.location.href = "/chat/"+userid+"/"+username; // Redirect to enter.html if local storage has username
        // window.location.href = '/redirecter'; // Redirect to enter.html if local storage has username
    }
    
    if (localStorage) {

// Add an event listener for form submissions
  document.getElementById('formms').addEventListener('submit', function() {
// Get the value of the name field.
  var name = document.getElementById('name').value.trim();
// Save the name in localStorage.
    // console.log(name);
    var Uniquer = '<%= Unique %>';
    var secretkey = Math.floor(Math.random() * 1000000);

  localStorage.setItem('username', name);
  localStorage.setItem('secret', secretkey);
  localStorage.setItem('UniqueID', Uniquer);
    socket.emit('makeid',name,secretkey,Uniquer);
});


} 
}