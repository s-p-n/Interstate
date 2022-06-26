tool
extends EditorPlugin
var WebSocket
var dock
var io

func _enter_tree():
	print("Interstate Plugin has enterred tree.")
	dock = preload("res://addons/interstate/dock/dock.tscn").instance()
	dock.connect("ready", self, "setup_dock")
	add_control_to_dock(DOCK_SLOT_LEFT_UL, dock)

func setup_dock():
	dock.set_listener(self, "establish_connection")

func establish_connection():
	print("Got connect btn click")
	var url = dock.url.text
	print("URL: ", url)
	if !WebSocket or !is_instance_valid(WebSocket):
		print("Creating new WebSocket instance")
		WebSocket = preload("res://addons/interstate/webSocket/WebSocket.tscn").instance()
		print("main tree: ", get_tree())
		WebSocket.set_tree(get_tree())
		print("connecting setup signal to dock.")
		WebSocket.connect("setup", dock, "connect_to_WebSocket")
		#dock.connect_to_WebSocket(WebSocket)
	WebSocket.establish_connection(url)

func _exit_tree():
	print("Interstate Plugin has exited tree.")
	remove_control_from_docks(dock)
	pass
