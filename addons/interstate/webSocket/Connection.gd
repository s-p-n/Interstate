tool
extends Node

const WAIT_TIME:float = 5.0
const LOOP_TIME:float = 0.05

signal fail
signal connect(client)
signal heartbeat(delta)
signal packet(channel, data)
signal disconnect
signal error

var WebSocket:Node
var client:WebSocketClient
var packet_queue = []
var is_connected = false
var waiting_for_connection = false
var time = 0
var when_connection_lost = 0
var is_setup = false
var tree = null
var should_loop = false

func _init():
	print("Connection node init.")
	#_setup()
	#_end_connection()
	#_loop()

func _loop():
	should_loop = true
	while should_loop:
		var time = OS.get_ticks_msec()
		#print(self, " Looping")
		if is_instance_valid(get_tree()):
			yield(get_tree().create_timer(LOOP_TIME), "timeout")
			_poll(OS.get_ticks_msec() - time)
		else:
			should_loop = false

func _poll(_delta):
	#print("polling ", _delta)
	var is_connecting = client.get_connection_status() == client.CONNECTION_CONNECTING
	var is_connected = client.get_connection_status() == client.CONNECTION_CONNECTED
	if is_connecting or is_connected:
		client.poll()

func get_tree():
	if is_instance_valid(WebSocket):
		return WebSocket.tree
	return null

func establish_connection(url):
	if should_loop:
		print("Already trying to connect! Ignoring your petty request..")
		return
	
	_setup()
	
	var err = client.connect_to_url(url)
	if err != OK:
		print("Connection Error: ", err)
		emit_signal("fail")
		return
	else:
		print("Trying to establish a connection to: ", url)
		_listen_for_connection()

func _listen_for_connection():
	#when_connection_lost = time + WAIT_TIME
	#waiting_for_connection = true
	print("Waiting ", WAIT_TIME, " seconds for a connection.")
	_loop()
	yield(get_tree().create_timer(WAIT_TIME), "timeout")
	if should_loop:
		_wait_for_timeout()
	#set_process(true)

func _wait_for_timeout():
	#print("Waiting for connection until ", time, " >= ", when_connection_lost)
	#if time >= when_connection_lost:
	#waiting_for_connection = false
	print("Done waiting 5 seconds.")
	if is_connected:
		print("I see we've connected. Very well, I won't kill you.")
		return
	else:
		print("I've been waiting all my life for this, good-bye, connection attempt!!\nMuahahahahaha")
		_end_connection()
func send(data:String):
	if is_connected:
		client.get_peer(1).put_packet(data.to_utf8())
	else:
		packet_queue.append(data)
		
func _setup():
	if !is_setup:
		print("Setting up Connection Node.")
		is_setup = true
		packet_queue = []
		is_connected = false
		waiting_for_connection = false
		time = 0
		when_connection_lost = 0
		
		WebSocket = get_parent()
		
		if !is_instance_valid(WebSocket):
			print("Nothing is valid anymore!! AHHHH")
			return
			#return self.queue_free()
			
		client = WebSocket.client
		_end_connection()
		if len(client.get_signal_connection_list("connection_closed")) > 0:
			client.disconnect("connection_closed", self, "_on_closed")
			client.disconnect("connection_error", self, "_on_error")
			client.disconnect("connection_established", self, "_on_established")
			client.disconnect("data_received", self, "_on_data")
		
		client.connect("connection_closed", self, "_on_closed")
		client.connect("connection_error", self, "_on_error")
		client.connect("connection_established", self, "_on_established")
		client.connect("data_received", self, "_on_data")
		

func _on_closed(was_clean = false):
	_end_connection()
	print("Closed, clean: ", was_clean)

func _on_error():
	_end_connection()
	print("WebSocket->Connection Error")

func _on_established(proto):
	is_connected = true
	emit_signal("connect", client)
	print("Connection established under protocol: ", proto)

func _on_data(data):
	print("Got data: ", data)
	WebSocket.Distributor.handle_data(data)

func _end_connection():
	is_connected = false
	should_loop = false
	var cur_status = client.get_connection_status()
	if cur_status == client.CONNECTION_CONNECTING or cur_status == client.CONNECTION_CONNECTED:
		client.disconnect_from_host()
	emit_signal("fail")
