tool
extends Control

onready var btn = $Connect/Connect
onready var label = $Connect/Label

var connection:WebSocketClient

var listener = {
	"method_name": "",
	"obj": null
}

func set_listener(obj, method_name):
	listener["method_name"] = method_name
	listener["obj"] = obj

func connect_to_WebSocket(ws):
	ws.Connection.connect("connect", self, "_on_connect")
	ws.Connection.connect("disconnect", self, "_on_disconnect")
	ws.Connection.connect("fail", self, "_on_disconnect")
	print("Dock connected to WebSocket.")

func _on_connect(client):
	connection = client
	print('dock has connection: ', connection)
	label.text = "Connected!"

func _on_disconnect():
	connection = null
	print('dock got disconnect')
	label.text = ''
	label.visible = false
	btn.visible = true

func _on_click():
	if is_instance_valid(listener["obj"]) and listener["obj"].has_method(listener["method_name"]):
		btn.visible = false
		label.text = "Connecting.."
		label.visible = true
		listener["obj"].call(listener["method_name"])
		
