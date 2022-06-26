tool
extends Control

onready var url = $PanelContainer/Panel/Tree/URL/LineEdit
onready var btn = $PanelContainer/Panel/Tree/Connect/Connect
onready var label = $PanelContainer/Panel/Tree/Connect/Label

export var default_url = "localhost:4200"

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
	ws.Connection.connect("fail", self, "_on_fail")
	print("Dock connected to WebSocket.")

func setup_for_connection():
	if is_instance_valid(btn):
		btn.text = "Connect"
		btn.disabled = false
		url.editable = true

func _ready():
	print("Dock ready")
	url.text = default_url
	setup_for_connection()

func _on_fail():
	if is_instance_valid(label):
		label.text += "\nconnection failed."
		setup_for_connection()

func _on_connect(client):
	if is_instance_valid(client) and is_instance_valid(label):
		connection = client
		print('dock has connection: ', connection)
		label.text += "\nConnected to %s." % url.text
		btn.text = "Disconnect"
		btn.disabled = false
	

func _on_disconnect():
	connection = null
	if is_instance_valid(label):
		label.text += "\nDisconnected from %s" % url.text
		btn.text = "Connect"
		btn.disabled = false
		url.editable = true

func _on_click():
	if !is_instance_valid(btn) or btn.disabled:
		return
	
	if is_instance_valid(listener["obj"]) and listener["obj"].has_method(listener["method_name"]):
		if btn.text == "Connect":
			btn.disabled = true
			label.text += "\nConnecting to %s.." % url.text
			url.editable = false
			listener["obj"].call(listener["method_name"])
		elif btn.text == "Disconnect" and is_instance_valid(connection):
			connection.disconnect_from_host()
			btn.disabled = true
			label.text += "\nDisconnecting from %s." % url.text
			
		
