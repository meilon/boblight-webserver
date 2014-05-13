$( document ).bind( 'mobileinit', function(){
  $.mobile.loader.prototype.options.text = "Verbinde...";
  $.mobile.loader.prototype.options.textVisible = true;
  $.mobile.loader.prototype.options.theme = "a";
  $.mobile.loader.prototype.options.html = "";
});

$(document).bind('pageinit', function(){
    // WebSocket
    var socket = io.connect();
	socket.on('connect', function () {
		$.mobile.loading( 'hide' );
		$('#sockstat').text("Verbunden!")
	});
	socket.on('connecting', function () {
		$.mobile.loading( 'show' );
		$('#sockstat').text("Verbinde...")
	})
	socket.on('disconnect', function () {
		$('#sockstat').text("Getrennt")
	}) 
	socket.on('connect_failed', function () {
		$('#sockstat').text("Verbindung fehlgeschlagen")
	})
	socket.on('reconnect_failed', function () {
		$('#sockstat').text("Wiederverbinden fehlgeschlagen")
	})
	socket.on('reconnect', function () {
		$('#sockstat').text("Wiederverbunden")
	})
	socket.on('reconnecting', function () {
		$.mobile.loading('show');
		$('#sockstat').text("Wiederverbinden...")
	})
	socket.on('error', function () {
		$('#sockstat').text("Fehler!")
		socket = io.connect();
	})
	
	socket.on('currData', function (data) {
		$('#status').val(data.status).slider('refresh');		
		$('#red').val(data.red).slider('refresh');
		$('#green').val(data.green).slider('refresh');
		$('#blue').val(data.blue).slider('refresh');
	});
	
	socket.on('presets', function (data) {
		$('#presets').find('option').remove();
		$.each(data.presets, function(index, value){
			$('#presets').append($("<option>",{
                value: index,
                text: value["name"]
			}));
		});
	});
	
	
	$('#status').on('slidestop', function(event) {
		socket.emit('status', $(this).val());
	});
	
	$('#red').on('slidestop', function(event) {
		socket.emit('red', $(this).val());
	});	
	$('#green').on('slidestop', function(event) {
		socket.emit('green', $(this).val());
	});	
	$('#blue').on('slidestop', function(event) {
		socket.emit('blue', $(this).val());
	});
	
	$('#presets').on('change', function(event) {
		socket.emit('preset', $(this).val());
	});
});