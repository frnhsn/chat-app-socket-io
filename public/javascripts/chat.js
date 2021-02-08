const socket = io();

// Elements
const $messageButton = document.querySelector('#send-message-button');
const $locationButton = document.querySelector('#send-location-button');
const $messageFormInput = document.querySelector('#send-message-input');
const $message = document.querySelector('#message');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const userListTemplate = document.querySelector('#user-list-template').innerHTML;

// Options
let {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

// Autoscroll
const autoscroll = () => {
  const $newMessage = $message.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $message.offsetHeight;

  const containerHeight = $message.scrollHeight;

  const scrollOffset = $message.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight;
  }

}

// Retrieve a room list
socket.on('roomData', roomData => {

  const html = Mustache.render(userListTemplate, {
    name: roomData.name,
    users: roomData.users,
  });

  $sidebar.insertAdjacentHTML("beforeend", html);
})

// Listen message
socket.on('message', (message) => {

  const html = Mustache.render(messageTemplate, {
    text: message.text,
    createdAt: moment(message.createdAt).format('h:m:s'),
  });

  $message.insertAdjacentHTML('beforeend', html);

  autoscroll();
})

// Listen location message
socket.on('broadcastLocation', (loc) => {

  const html = Mustache.render(locationTemplate, {
    url: loc.url,
    createdAt: moment(loc.createdAt).format('h:m:s'),
  });

  $message.insertAdjacentHTML('beforeend', html);

  autoscroll();
})

// Send a message and modify button stage
$messageButton.addEventListener('click', (e) => {

  let message = document.querySelector('#send-message-input').value
  e.preventDefault();

  if (message.length > 0 && /\S/.test(message)) {
    $messageFormInput.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', message, (ack) => {
      $messageFormInput.removeAttribute('disabled');
      $messageFormInput.value = '';
      $messageFormInput.focus();
      console.log(ack);
    });
  }

});

// Sending a location
$locationButton.addEventListener('click', (e) => {    

  e.preventDefault();
  $locationButton.setAttribute('disabled', 'disabled');

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition(position => {
    let location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit('sendLocation', location, (ack) => {
      $locationButton.removeAttribute('disabled');
    })
  })

});

if (username && room) {
  socket.emit('join', {username, room}, (err) => {
    if (err) location.href = '/';
  });

}
