function getOnlineUsersHandler(io, onlineUsers) {
	// io.emit(): emits `getOnlineUsers` event to all the connected clients.    
    console.log(onlineUsers);
    
	io.emit("getOnlineUsers", {
		message: "success",
		onlineUsers: Object.keys(onlineUsers),
	});
}

export default getOnlineUsersHandler;
