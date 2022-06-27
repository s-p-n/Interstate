tool
extends Control

onready var url = $PanelContainer/Panel/Tree/URL/LineEdit
onready var btn = $PanelContainer/Panel/Tree/Connect/Connect
onready var log_text = $PanelContainer/Panel/Tree/Connect/Panel/Log

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
	log_text.text = "Interstate Ready."
	setup_for_connection()

func _on_fail():
	if is_instance_valid(log_text):
		log_line("Connection failed.")
		setup_for_connection()

func _on_connect(client):
	if is_instance_valid(client) and is_instance_valid(log_text):
		connection = client
		print('dock has connection: ', connection)
		log_line("Connected to %s." % url.text)
		btn.text = "Disconnect"
		btn.disabled = false
	

func _on_disconnect():
	connection = null
	if is_instance_valid(log_text):
		log_line("Disconnected from %s" % url.text)
		btn.text = "Connect"
		btn.disabled = false
		url.editable = true

func _on_click():
	if !is_instance_valid(btn) or btn.disabled:
		return
	
	if is_instance_valid(listener["obj"]) and listener["obj"].has_method(listener["method_name"]):
		if btn.text == "Connect":
			btn.disabled = true
			log_line("Connecting to %s.." % url.text)
			url.editable = false
			listener["obj"].call(listener["method_name"])
		elif btn.text == "Disconnect" and is_instance_valid(connection):
			connection.disconnect_from_host()
			btn.disabled = true
			log_line("Disconnecting from %s." % url.text)
			
func log_line(text):
	log_text.text += "\n%s" % text
	log_text.cursor_set_line(log_text.get_line_count())
