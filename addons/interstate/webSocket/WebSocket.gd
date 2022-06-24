tool
extends Node

signal setup(WebSocket)

var Connection:Node
var Distributor:Node
var tree = null
var client = WebSocketClient.new()
var is_ready = false
func _setup():
	print("Setting up WebSocket Node")
	Connection = get_node("Connection")
	Distributor = get_node("Distributor")
	Connection.connect("fail", self, "_handle_failure")
	is_ready = true
	print("WebSocket ready")
	emit_signal("setup", self)

func set_tree(new_tree):
	tree = new_tree

func establish_connection (url:String):
	if !is_ready:
		_setup()
	
	return Connection.establish_connection(url)

func _handle_failure():
	print("WebSocket Failed to connect.")

func on (channel:String, obj:Object, method_name:String):
	return Distributor.on(channel, obj, method_name)

func emit (channel:String, data:Dictionary):
	var packet = Distributor.format_packet(channel, data)
	return Connection.send_packet(packet)
