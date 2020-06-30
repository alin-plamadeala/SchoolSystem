$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7",
  ];

  // Initialize variables
  var $window = $(window);
  var $usersList = $(".usersList"); // current user list
  var $usersNum = $("#usersNum"); // current user list
  var $messages = $(".messages"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box
  var topHeight = $("#top").height();
  var bottomHeight = $("#bottom").height();
  var chatHeight = $window.height() - topHeight - bottomHeight - 220;

  var user;
  var typing = false;
  var socket = io();

  $(".chatArea").height(chatHeight);

  // Adds the visual chat message to the message list
  const addChatMessage = (data) => {
    var $usernameDiv = $('<span class="username"/>')
      .text(data.user.username)
      .css("color", getUsernameColor(data.user.username));
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var $messageDiv = $('<li class="message"/>')
      .data("username", data.user.username)
      .append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv);
  };

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el) => {
    var $el = $(el);
    $messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  // Prevents input from having injected markup
  const cleanInput = (input) => {
    return $("<div/>").text(input).html();
  };

  // Gets the color of a username through  hash function
  const getUsernameColor = (username) => {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  };

  // Keyboard events

  $window.keydown((event) => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $inputMessage.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (user) {
        sendMessage();
      }
    }
  });

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message) {
      $inputMessage.val("");
      addChatMessage({
        user: user,
        message: message,
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit("new message", message);
    }
  };
  // refresh userlist contents
  const updateUserList = (userList) => {
    $usersNum.text(userList.length);
    $usersList.html("");
    $.each(userList, (index, value) => {
      var $usernameDiv = $("<li />")
        .text(value.username)
        .css("color", getUsernameColor(value.username));
      $usersList.append($usernameDiv);
    });
  };

  // Socket events

  // on connect send the username to server
  socket.on("connect", () => {
    $.get("../current-user", (response) => {
      user = {
        id: response.id,
        username: response.firstName + " " + response.lastName,
      };
      // If the user is valid
      if (user) {
        $inputMessage.focus();

        // Tell the server your username
        socket.emit("join user", user);
      }
    });
  });

  // Whenever the server emits 'update users', update the user list
  socket.on("update users", (data) => {
    updateUserList(data.chatUsers);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on("new message", (data) => {
    addChatMessage(data);
  });

  // Whenever the server emits 'multiple windows', display a warning
  socket.on("multiple windows", () => {
    $(".chatPage").html(
      `<h3>Please close all other chat windows and refresh the page!</h3>`
    );
  });
});
