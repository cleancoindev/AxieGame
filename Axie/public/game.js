var socket = io();
socket.on('idSent', function (data){
  window.axies[data.id] = {
    coordinates : data.coordinates,
    //axie : window.fetchNewAxie()
  }
  window.myAxie = window.axies[data.id].axie;
});
socket.on('message', function(data) {
  console.log(data);
  //socket.emit('echo1', 'This is an echo');
});

socket.on('userConnected', function(data) {
  window.axies[data.id] = {
    coordiantes : data.coordinates
    //axie : window.fetchNewAxie()
  }
});

function updateAxieMovement (){
  //console.log('update');
  if (window.gameReady)
  socket.emit('updateAxieMovement', window.movement);
}

socket.on('updatedAxieMovement', function(coordinates){
  if (window.gameReady)
  {
    window.myAxie.position.x = coordinates.x;
    window.myAxie.position.y = coordinates.y;
  }
  });