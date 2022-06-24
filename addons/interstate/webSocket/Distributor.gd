tool
extends Node

var listeners = []

func _attempt_create_channel(channel:String):
	listeners[channel] = []
	return true

func format_packet(channel:String, data:Dictionary):
	return JSON.print({
		"channel": channel,
		"data": data
	})

func on(channel:String, obj:Object, method_name:String):
	if !listeners[channel]:
		if !_attempt_create_channel(channel):
			print("Could not create channel: ", channel)
			return
	listeners[channel].append({
		"obj": obj,
		"method_name": method_name
	})
	
func handle_data(data):
	print("Distributor got data: ", data)
