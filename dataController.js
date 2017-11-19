angular.module('scheduleAssistant', ['ui.bootstrap','ngAutocomplete','ui.tree','uiGmapgoogle-maps','angularFileUpload','textAngular','google.places']);

angular.module('scheduleAssistant').controller('mapCtrl', ['$scope', '$compile', 'mySharedService', 'uiGmapIsReady',  
function($scope, $compile, sharedService, uiGmapIsReady){
    
    $scope.map = {
        center: {latitude: 35.554498, longitude: 139.6485728},
        zoom: 14,
        control: {}
    };
    
    $scope.jsoncontent = '';
    
    $scope.realtimeSensors = [];    //array to store realtimeSensors data from sharedService
    
    $scope.tooltips = new Array();
    
    $scope.chartInstances = new Array();
	$scope.chartData = new Array();
	$scope.firstFlag = new Array();
    
    $scope.searchResult = null; 
    $scope.marker = {
        coords: {
                latitude: 35.554498,
                longitude: 139.6485728
            },
        title: '',
        content: '',
        show: false,
        icon: 'img/push_pin.png',
        id: 0,
        options: {
            opacity: 0,
            draggable: false
        },
        events: {
            dragend: function(marker, eventName, args) {
            $console.info('marker dragend');
            $console.info(marker.getPosition().lat());
            $console.info(marker.getPosition().lng());
            }
        }   
    };
    
    uiGmapIsReady.promise()
    .then(function (map_instances){
        $scope.mapInstance = $scope.map.control.getGMap();
        $scope.mapInstance.addListener('bounds_changed', function(){
        for(i = 0; i<$scope.tooltips.length; i++)
            $scope.tooltips[i].style("opacity", 0);    
        });
    });
    
    $scope.updateMapcenter = function(){
       if($scope.jsoncontent.locs || $scope.realtimeSensors)
       {
           var averLat = 0;
           var averLng = 0;
           var length = 0;
           if($scope.jsoncontent.locs)
           {
            for(var i=0; i<$scope.jsoncontent.locs.length; i++)
               {
                   averLat = averLat + parseFloat($scope.jsoncontent.locs[i].lat);
                   averLng = averLng + parseFloat($scope.jsoncontent.locs[i].lng);
               }
               length = length + $scope.jsoncontent.locs.length;
           }
           if($scope.realtimeSensors)
           {
            for(var i=0; i<$scope.realtimeSensors.length; i++)
               {
                   averLat = averLat + parseFloat($scope.realtimeSensors[i].lat);
                   averLng = averLng + parseFloat($scope.realtimeSensors[i].lng);
               }
               length = length + $scope.realtimeSensors.length;
           }
           if(length > 0)
           {
               averLat = averLat / length;
               averLng = averLng / length;
               //console.info("Average Lat & Lng: ", averLat, averLng);
               $scope.map.center.latitude = averLat;
               $scope.map.center.longitude = averLng;
               //console.info("Map Center: ", $scope.map.center);
           }

       }        
    }
    
    $scope.updateMapview = function()
    {
        if($scope.jsoncontent.locs || $scope.realtimeSensors){
            var locs = $scope.jsoncontent.locs;
            var rtss = $scope.realtimeSensors;
            console.info(locs, rtss);
            var bounds = new google.maps.LatLngBounds();
            if(locs)
            for(var i=0; i<locs.length; i++)
            {
                var point = new google.maps.LatLng(locs[i].lat, locs[i].lng);
                bounds.extend(point);
            }
            if(rtss)
            for(var i=0; i<rtss.length; i++)
            {
                var point = new google.maps.LatLng(rtss[i].lat, rtss[i].lng);
                bounds.extend(point);
            }
            window.anMap.fitBounds(bounds);
        }
    }
    
    //update all d3 elements according to data contained in jsoncontent.locs and jsoncontent.lnks
    
    $scope.updateD3 = function(){
       var map = window.anMap;
       console.info('map',map);
       
       if(d3.select("div.SvgOverlay"))
       {
           d3.select("div.SvgOverlay").remove();
       }
       if(overlay)
       {
           overlay.setMap(null);
       }
       
       var overlay = new google.maps.OverlayView();
       overlay.onAdd = function() 
       {
            var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
                .attr("class", "SvgOverlay");
            var svg = layer.append("svg");
            var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
            var adminDivisions = svg.append("g").attr("class", "AdminDivisions");
            var lineGroup = svg.append("g").attr("class", "lines");
            var locGroup = svg.append("g").attr("class", "locs");
           
            overlay.draw = function()
            {
                var projection = this.getProjection(),
                    //padding = 16;
                    locs = $scope.jsoncontent.locs,
                    lnks = $scope.jsoncontent.lnks,
                    rtss = $scope.realtimeSensors;
                  
               //draw lnks
                var linefunction = d3.svg.line()
                    .x(function(d) {return d.x;})
                    .y(function(d) {return d.y;})
                    .interpolate("cadinal");
               
                lineGroup.selectAll("path").remove();
                //for(var i=0; i<lnks.length; i++)
                //{
                var lnkMarkers = lineGroup.selectAll("path")
                    .data(lnks)
                    .enter().append("path")
                    .each(transformGroups)
                    .attr("d", function(d){return linefunction(d.points);})
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "purple";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "2px";})
                    .style("fill",function(d){if(d.style.fill)return d.style.fill; else return "none";})
                    .on("mouseover", function(d){
                        tooltip.transition()
                        .duration(200)
                        .style("opacity",.9);
                        tooltip.html(d.content)
                        .style("left",(d3.event.pageX + 5) + "px")
                        .style("top",(d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d){
                        tooltip.transition()
                        .duration(200)
                        .style("opacity",0);
                    });
               //console.info("lnkMarkers:", lnkMarkers);
                //}
               
               //draw locs
               //locGroup.selectAll("circle").remove();
               var locMarkers = locGroup.selectAll("circle")
                    .data(rtss)
                    .each(transform)
                    .attr({
                        cx: function(d){return d.cx;},
                        cy: function(d){return d.cy;},
                        r: function(d){if(d.style.r)return d.style.r; else return 10;}
                    })
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "red";})
                    .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "lightblue";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "1px";})
                    .enter().append("circle")
                    .each(transform)
                    .attr({
                        cx: function(d){return d.cx;},
                        cy: function(d){return d.cy;},
                        r: function(d){if(d.style.r)return d.style.r; else return 10;}
                    })
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "red";})
                    .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "lightblue";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "1px";})
                    .on("click", function(d,i){
                        console.info("Map Clicked!");
                        if($scope.tooltips[i].style("opacity")!= 0)
                        {    $scope.tooltips[i].transition()
                            .duration(200)
                            .style("opacity", 0);
                        }
                        else
                        {
                            $scope.tooltips[i].transition()
                            .duration(200)
                            .style("opacity",.9);
							if(d.viz && d.type == 'realtime' && d.filter)
                            {
								switch(d.viz)
                                {
									case 'line':
										if($scope.chartData[i].length > 0)
										{
										//console.info('chartData:',chartData[i]);
											var legend = '';
											var colors = ['1f77b4','ff7f0e','2ca02c','d62728','9467bd','8c564b','e377c2','7f7f7f','bcbd22','17becf'];
											for(var j = 0; j < d.filter.length; j++)
											{
												legend = legend + '<div style="width:20px; height: 10px; position: relative; float: left"></div><div style="width: 10px; height: 10px; background: #'+colors[j]+'; position: relative; float: left"></div><div style="height: 10px; position: relative; float: left">' + d.filter[j]+'</div>';
											}
											$scope.tooltips[i].html("<div id='chart"+i+"' class='epoch category10' style='position: relative;height: 200px;'></div><div id='legend"+i+"' style='position: relative; height: 10px; width: 100%'>"+legend+"</div>")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
                                            $scope.$apply();
											$scope.chartInstances[i] = $('#chart'+i).epoch({
												type: 'time.line',
												data: $scope.chartData[i],
												axes: ['left', 'bottom'],
												margins: {left: 30, right: 10}
											});
												
										//d3.select('#legend'+i)
										//console.info('chartInstance',chartInstances[i]);
										}
										else
											$scope.tooltips[i].html("Data for visualization is not ready. Please wait and reclick.")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
										break;
                                    case 'area':
                                        if($scope.chartData[i].length > 0)
										{
											var legend = '';
											var colors = ['1f77b4','ff7f0e','2ca02c','d62728','9467bd','8c564b','e377c2','7f7f7f','bcbd22','17becf'];
											for(var j = 0; j < d.filter.length; j++)
											{
												legend = legend + '<div style="width:20px; height: 10px; position: relative; float: left"></div><div style="width: 10px; height: 10px; background: #'+colors[j]+'; position: relative; float: left"></div><div style="height: 10px; position: relative; float: left">' + d.filter[j]+'</div>';
											}
											$scope.tooltips[i].html("<div id='chart"+i+"' class='epoch category10' style='position: relative;height: 200px;'></div><div id='legend"+i+"' style='position: relative; height: 10px; width: 100%'>"+legend+"</div>")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
                                            $scope.$apply();
											$scope.chartInstances[i] = $('#chart'+i).epoch({
                                            	type: 'time.area',
												data: $scope.chartData[i],
												axes: ['left', 'bottom'],
												margins: {left: 30, right: 10}
                                        	});}
										else
											$scope.tooltips[i].html("Data for visualization is not ready. Please wait and reclick.")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
                                    	break;
									case 'bar':
										if($scope.chartData[i].length > 0)
										{
											var legend = '';
											var colors = ['1f77b4','ff7f0e','2ca02c','d62728','9467bd','8c564b','e377c2','7f7f7f','bcbd22','17becf'];
											for(var j = 0; j < d.filter.length; j++)
											{
												legend = legend + '<div style="width:20px; height: 10px; position: relative; float: left"></div><div style="width: 10px; height: 10px; background: #'+colors[j]+'; position: relative; float: left"></div><div style="height: 10px; position: relative; float: left">' + d.filter[j]+'</div>';
											}
											$scope.tooltips[i].html("<div id='chart"+i+"' class='epoch category10' style='position: relative;height: 200px;'></div><div id='legend"+i+"' style='position: relative; height: 10px; width: 100%'>"+legend+"</div>")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
											$scope.$apply();
											$scope.chartInstances[i] = $('#chart'+i).epoch({
                                               	type: 'time.bar',
                                               	data: $scope.chartData[i],
												axes: ['left', 'bottom'],
												margins: {left: 30, right: 10}
                                        });}
										else
											$scope.tooltips[i].html("Data for visualization is not ready. Please wait and reclick.")
                                    		.style("left", (d3.event.pageX + 5) + "px")
                                    		.style("top", (d3.event.pageY - 28) + "px");
										break;
                                    }
                                }
							
                            else if(d.content)
                                $scope.tooltips[i].html(d.content)
                                .style("left", (d3.event.pageX + 5) + "px")
                                .style("top", (d3.event.pageY - 28)+ "px");
                            else
                                $scope.tooltips[i].html("Loading...")
                                .style("left", (d3.event.pageX + 5) + "px")
                                .style("top", (d3.event.pageY - 28)+ "px");
                        }
                        
                    });
               
               function transform(loc)
                {
                    var googleCoordinates = new google.maps.LatLng(loc.lat, loc.lng);
                    var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
                   loc.cx = pixelCoordinates.x + 4000;
                   loc.cy = pixelCoordinates.y + 4000;
                   
                   //console.info("loc in transform:", loc, loc.x, loc.y);
                    return loc;
                };
                
                function transformGroups(lnk)
                {
                   for(var i=0;i<lnk.points.length;i++)
                   {
                       var googleCoordinates = new google.maps.LatLng(lnk.points[i].lat, lnk.points[i].lng);
                        var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
                        lnk.points[i].cx = pixelCoordinates.x + 4000;
                        lnk.points[i].cy = pixelCoordinates.y + 4000;
                   }
                   //console.info("lnkPoints in transform:", lnk);
                   return lnk;
                } 
            };
       
 
        };
       
        overlay.setMap(map); 
        
    }

    //use functions above to update the whole map view
    $scope.updateMapAll = function(type){
        $scope.updateMapview(); //revised by wu2
        $scope.updateD3();
    }

    //update data according to htmlSubmit message 
    $scope.$on('htmlSubmit', function(){
        //console.info('mapCtrl','htmlSubmit');
        $scope.jsoncontent = sharedService.jsoncontent;
        
        $('.tooltip').remove();
        $scope.tooltips = new Array();
    
        $scope.chartInstances = new Array();
        $scope.chartData = new Array();
        $scope.firstFlag = new Array();
        
        sharedService.prepForBroadcast('realtimeSensorsUpdate');
        //console.info('jsoncontent:',$scope.jsoncontent);
        //sharedService.prepForBroadcast('mapUpdate', 'all');
    });
    
    //update data according to jscontentUpdate message, currently is the same as htmlSubmit
    $scope.$on('jscontentUpdate', function(){
        //console.info('mapCtrl','jscontentUpdate');
        $scope.jsoncontent = sharedService.jsoncontent;
        //console.info('jsoncontent:',$scope.jsoncontent);
        //sharedService.prepForBroadcast('mapUpdate', 'all');
    });
    
    //update map view with parameters: mapCenter to change map center, mapView to change boundingbox, d3 to update d3
    $scope.$on('mapUpdate', function(){               
        if(sharedService.mapUpdateType == 'all'){$scope.updateMapAll();}
        else if(sharedService.mapUpdateType == 'mapCenter'){$scope.updateMapcenter();}
        else if(sharedService.mapUpdateType == 'mapView'){$scope.updateMapview();}  //add by wu2
        else if(sharedService.mapUpdateType == 'd3'){$scope.updateD3();}
    });
    
    $scope.$on('realtimeSensorsUpdate', function(){               
        $scope.realtimeSensors = sharedService.realtimeSensors;
        
        function isAmongKeys(testString, keys)
        {//This function checks whether a string is among the dataset keys.
            for(var index=0; index<keys.length; index++)
            {
                if(testString == keys[index])
                    return true;
            }
            return false;
        }
        
        for(j=0;j<$scope.realtimeSensors.length;j++)
        {
            $scope.chartInstances[j] = null;
            $scope.chartData[j] = new Array();
            var socket = {
                listener: io.connect($scope.realtimeSensors[j].src, {reconnect: 'true'}),
                index: j,
            };
            $scope.firstFlag[j] = true; 
            
			$scope.tooltips[j] = d3.select("body")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);
            
            socket.listener.on('connect', function(data){
                console.info('socket connected');
            });
            
            socket.listener.on('senList', function(data){
                    d = JSON.parse(data);
                    keys = Object.keys(d);
                    console.info(d, keys);
                    //$scope.locs[this.index].content = "<div>Acoustic Noise: "+ d.val_noise +",<br>Temperature: " + d.val_temp + ",<br>Light: " + d.val_light +", <br>Humidity: " + d.val_humi + " </div>";
                    //Check if is the first time receive data. If is, check the keys in filters are among valid data keys and then construct new valid filters.
					if($scope.firstFlag[this.index] && $scope.realtimeSensors[this.index].filter)
					{
						var newFilter = new Array();
						for(var i=0; i < $scope.realtimeSensors[this.index].filter.length; i++)
						{
							if(isAmongKeys($scope.realtimeSensors[this.index].filter[i], keys))
								newFilter.push($scope.realtimeSensors[this.index].filter[i]);
							else
								console.log("Filter Key: " + $scope.realtimeSensors[this.index].filter[i] +" is not Among Valid Keys. Please Check!");
						}
						$scope.realtimeSensors[this.index].filter = newFilter;
						
						if($scope.realtimeSensors[this.index].viz)
						{
							//var legend = '';
							for(var i=0; i < $scope.realtimeSensors[this.index].filter.length; i++)
                        	{
								key = $scope.realtimeSensors[this.index].filter[i];
								$scope.chartData[this.index].push({
									label: key,
									values:[{time: Date.parse(d.time)/1000, y:d[key]}]
								});
								//legend = legend + '<div style="width: 20px; height: 20px; background: red"></div>' + key;
							}
							//console.info('legend:', legend, $('#legend'+this.index));
							//document.getElementById('legend'+this.index).innerHTML = legend;
							console.log("Initial chart data: ", $scope.chartData[this.index]);
						}
						$scope.firstFlag[this.index] = false;
					}
				
					
                    if($scope.realtimeSensors[this.index].filter)
                    {
						if(!$scope.realtimeSensors[this.index].viz)
						{//If not visualization, construct plain html content
							$scope.realtimeSensors[this.index].content = '<div>';
                        	for(var i=0; i < $scope.realtimeSensors[this.index].filter.length; i++)
                        	{
                                	key = $scope.realtimeSensors[this.index].filter[i];
                                	$scope.realtimeSensors[this.index].content = $scope.realtimeSensors[this.index].content + key + ":" + d[key] + "<br>";
                        	}
							$scope.realtimeSensors[this.index].content += "</div>";
                    	//console.info('content:', $scope.locs[this.index].content);
							$scope.tooltips[this.index].html($scope.realtimeSensors[this.index].content);
                    	//$("#tooltip"+this.index).html($scope.locs[this.index].content);
						}
						else
						{//If visualization is necessary
							if(!$scope.firstFlag[this.index] && $scope.chartInstances[this.index])
							{
								var updateData = new Array();
								for(var i=0; i < $scope.realtimeSensors[this.index].filter.length; i++)
                        		{
									key = $scope.realtimeSensors[this.index].filter[i];
									updateData.push({
										time: Date.parse(d.time)/1000,
										y: d[key]
									});
								}
								$scope.chartInstances[this.index].push(updateData);
							}
							else if(!$scope.chartInstances[this.index])
								console.info("Chart instance not created!");
						}
                    }
                    else
                    {
						$scope.realtimeSensors[this.index].content = '<div>';
                        for(var i=0; i < keys.length; i++)
                        {
                            key = keys[i];
                            $scope.realtimeSensors[this.index].content = $scope.realtimeSensors[this.index].content + key + ":" + d[key] + "<br>";
                        }
						$scope.realtimeSensors[this.index].content += "</div>";
                    	//console.info('content:', $scope.locs[this.index].content);
						$scope.tooltips[this.index].html($scope.realtimeSensors[this.index].content);
                    	//$("#tooltip"+this.index).html($scope.locs[this.index].content);
					
                    }		
                    $scope.$apply();
			}.bind(socket));
            
        }
        //console.info('$scope.realtimeSensors:',$scope.realtimeSensors);
        
    });
    
    //update realtimeSensors data ,and map view in d3's tooltip accordingly (achieved automatically by data binding)
    $scope.$on('realtimeSensorUpdate', function(){               
        $scope.realtimeSensors = sharedService.realtimeSensors;
        //console.info('$scope.realtimeSensors:',$scope.realtimeSensors);
        $scope.$apply();
    });
    
    $scope.$on('locSearch', function(){
        console.info("Search Result in map control:", sharedService.searchResult);
        $scope.searchResult = sharedService.searchResult;
        
        $scope.map.center = {latitude: $scope.searchResult.geometry.location.lat(),
                             longitude: $scope.searchResult.geometry.location.lng()};
        
        $scope.marker = {
            coords: {
                latitude:  $scope.searchResult.geometry.location.lat(),
                longitude: $scope.searchResult.geometry.location.lng()
            },
            title: $scope.searchResult.name,
            content: $scope.searchResult.formatted_address,
            icon: 'img/push_pin.png',
            show: true,
            id: 1,
            options: {
                opacity: 100,
                draggable: true
            },
            events: {
            dragstart: function(marker, eventName, args){
                $scope.marker.show = false;
            },
            dragend: function(marker, eventName, args) {  
                $scope.marker.coords.latitude = marker.position.lat();
                $scope.marker.coords.longitude = marker.position.lng();
                var geocoder = new google.maps.Geocoder;
                var latlng = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                geocoder.geocode({'location': latlng}, function(results, status){
                    if(status === google.maps.GeocoderStatus.OK){
                        if(results[1]){
                            console.info("Reverse Geocoder Result: ", results[1]);
                            $scope.marker.content = results[1].formatted_address;
                            $scope.marker.title = null;
                        }
                        else
                            window.alert('No results found.');
                    }
                    else
                        window.alert('Geocoder failed due to: ' + status);
                });
                $scope.marker.show = true;
                }
            }
        };
        console.info("Google Marker:", $scope.marker);
        
        
        $scope.yesClicked = function(){
            //console.info('$scope.searchResult:', $scope.searchResult);
            //add by wu 8-11
            $scope.searchResult.geometry.location = new google.maps.LatLng($scope.marker.coords.latitude, $scope.marker.coords.longitude);
            sharedService.prepForBroadcast('insertConfirm', $scope.searchResult);
            $scope.marker.options.opacity = 0;
            $scope.marker.show = false;
        };
        
        $scope.noClicked = function(){
            $scope.searchResult = null;
            $scope.marker.options.opacity = 0;
            $scope.marker.show = false;   
             //console.info($scope.searchResult, sharedService.searchResult);
        };
    });
    
}]);

angular.module('scheduleAssistant').controller('uploadCtrl', ['$scope', 'FileUploader', 'mySharedService', function($scope, FileUploader, sharedService) {
        $scope.time = new Date();
        $scope.timeStamp = Date.parse($scope.time);
        if(!$scope.dirName)
            $scope.dirName = $scope.timeStamp;
    
        var formData = [{userName: "testUser1", blogName: "testBlog1", dirName: $scope.dirName}];
        var uploader = $scope.uploader = new FileUploader({        
            url: 'upload.php',
            formData: formData
        });

        // FILTERS

        uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                var ext = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
                //console.info('item:',item,'type:',type,'ext:',ext);
                if('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1)
                {
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type);
                }
                else
                {
                    return '|locs|lnks|'.indexOf(ext) !== -1;
                }
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            var ext = fileItem._file.name.slice(fileItem._file.name.lastIndexOf('.') + 1);
            console.info('onSuccessItem', fileItem, response, status, headers, ext);
            if(ext == "locs") //.locs file uploaded
            {
                $scope.locAddress = response.filePath;
                sharedService.prepForBroadcast('locUpload', $scope.locAddress);
            }
            else if(ext == "lnks")//.lnks file uploaded
            {
                $scope.lnkAddress = response.filePath;
                sharedService.prepForBroadcast('lnkUpload', $scope.lnkAddress);
            }
            else //image file uploaded
            {
                $scope.imgAddress = response.filePath;
                sharedService.prepForBroadcast('imgUpload', $scope.imgAddress); 
            }
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);

//angular.module('scheduleAssistant').controller('textCtrl',function($scope){});

function wysiwygeditor($scope, sharedService) {
		/*$scope.orightml = '<h2>Try me!</h2><p><lnk id="1" points=" keio university, #,  dhifes, 1234 " category="subway">This is a testing link.</lnk></p><p><lnk id="2" points="1234, #" style=" stroke: black; width: 3px; type : dotted;">This is another testing link.</lnk></p><p><loc name="1234" lat="35.57" lng="139.66" style="r:15;  fill: red; stroke : black; width: 5px;"></loc></p><p><loc type = \' university.1.~$!@#^&%*()-= \' id = "中文" lat="35.554498 " lng="139.6485728" name ="keio university">textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</loc></p><p><loc lat="35.55129247928427" lng="139.671764373779" name="#"></loc></p><p><loc name="dhifes" lat="35.58" lng="139.66"></loc><p><loc src="https://realtime.opensensors.io/v1/events/topics//orgs/wd/aqe/heartbeat?api-key=e40cc884-d147-4585-aa3c-ca1b9249171b" type="realtime">data.convertedvalue, data.serialnumber</loc></p><p><loc src="https://realtime.opensensors.io/v1/events/topics//orgs/wd/aqe/humidity/20630006?api-key=e40cc884-d147-4585-aa3c-ca1b9249171b"  lat="35.58" lng="139.66" type="realtime"></loc></p><p><loc src="https://data.melbourne.vic.gov.au/resource/ez6b-syvw.json" lat="data.latitude" lng="data.longitude" style="r: 5;fill: yellow;stroke: green;width: 1px;"></loc></p><p><loc src="https://data.seattle.gov/resource/ivtm-938t.json" lat="35.564498" lng="139.6585"></loc></p>';*/
        $scope.orightml = '<h2>Try me!</h2><p><loc name="kmd" lat="35.554498 " lng="139.6485728" id="mesh9" src="http://131.113.137.173:5000/node9" type="realtime"  viz="bar" filter="humi, light, temp, sound, press" style="r:15;  fill: red; stroke : black; width: 5px;"></loc></p>'
		$scope.htmlcontent = $scope.orightml;
		$scope.disabled = false;

    ////
    // Masquerade perfers the scope value over the innerHTML
    // Uncomment this line to see the effect:
    // $scope.htmlcontenttwo = "Override originalContents";
        
        $scope.$on('imgUpload', function(){
            $scope.imgAddress = sharedService.imgAddress;
            $scope.htmlcontent += '<img width="600px" src="' + $scope.imgAddress + '">';
            });
    
        $scope.$on('locUpload', function(){
            $scope.locAddress = sharedService.locAddress;
            $scope.htmlcontent += '<loc src="' + $scope.locAddress + '"></loc>';
        });
    
        $scope.$on('lnkUpload', function(){
            $scope.lnkAddress = sharedService.lnkAddress;
            $scope.htmlcontent += '<lnk src="' + $scope.lnkAddress + '"></lnk>';
        });
    
        $scope.$on('insertConfirm', function(){
            $scope.insertLoc = sharedService.insertLoc;
            $scope.htmlcontent += '<loc lat="' + $scope.insertLoc.geometry.location.lat() + '" lng="' + $scope.insertLoc.geometry.location.lng() + '" name="' + $scope.insertLoc.name + '">' + $scope.insertLoc.formatted_address + '</loc>';
        });
    
        $scope.$on('tab3click', function(){
            sharedService.prepForBroadcast('htmlSubmit', $scope.htmlcontent);//htmlSumit only update data now
            sharedService.prepForBroadcast('mapUpdate', 'all'); //so use mapUpdate to update map view
        });
    
	};

wysiwygeditor.$inject = ['$scope','mySharedService'];

angular.module('scheduleAssistant').controller('mainCtrl', ['$scope',  'mySharedService', 
    function($scope, sharedService){   
        
        $scope.place = null;
        
        $scope.$watch('tab', function(){
            if($scope.tab == 3)
            {
                //console.log(window.anMap);
                window.setTimeout(function(){
                    var center = window.anMap.getCenter();
                    google.maps.event.trigger(window.anMap, 'resize');
                    window.anMap.setCenter(center);
                },100);
                
                //add bu wu 8-11
                console.info('sharedService:',sharedService);
                
                /*
                if(sharedService.realtimeSensors)
                {
                    
                    for(var i = 0; i < sharedService.realtimeSensors.length; i++)
                    {
                        sharedService.realtimeSensors[i].data.close();
                        console.info('clear event');
                    }
                }
                */
            
                sharedService.prepForBroadcast('tab3click', '');
            }

        });
        
       $scope.searchPressed = function(){
           if($scope.place)//When keyword is not null and enter/Search button pressed.
           {
               if($scope.tab != 3)
                   $scope.tab = 3;//Jump to the map
               //window.setTimeout(function(){
                   //If is already an autocomplete result object
                   if($scope.place.geometry)
                   {
                       console.info("Autocomplete result:", $scope.place);
                       sharedService.prepForBroadcast('locSearch', $scope.place);
                   }
                   //If is a text string
                   else
                   {
                       var request = {
                       query: $scope.place
                       };
                   
                       var service = new google.maps.places.PlacesService(window.anMap);
                       service.textSearch(request, callback);
                   
                       function callback (response, status) {
                           console.info("Google status:", status);
                           console.info("Google Response:", response);
                           if(response)
                           {
                               $scope.place = response[0];
                               sharedService.prepForBroadcast('locSearch', $scope.place);
                           }
                           else
                               alert("Sorry! No search result!");
                       };
                   }
               //},100);
           }
           else
               alert("Please Enter Keyword!");
       };
        
     $scope.$on('insertConfirm', function(){
         $scope.tab = 2;
     });
}]);

//Communication between data controllers.
angular.module('scheduleAssistant').factory('mySharedService', 
    function($rootScope, $http, $q){
            var sharedService = {};
                
            sharedService.imgAddress = '';
            sharedService.htmlcontent = '';
            sharedService.jsoncontent = '';
            sharedService.locAddress = '';
            sharedService.lnkAddress = '';
            sharedService.searchResult = null;
            sharedService.insertLoc = null;
            sharedService.mapUpdateType = 'all';
            sharedService.realtimeSensors = [];
            sharedService.sensorUpdateIndex = -1;
    
            sharedService.prepForBroadcast = function(msgID, msgValue){
                switch(msgID)
                {
                    case 'imgUpload':
                        this.imgAddress = msgValue;
                        //console.info('imgUploadMsg:', msgValue);
                        break;
                    case 'locUpload':
                        this.locAddress = msgValue;
                        //console.info('locUploadMsg:', msgValue);
                        break;
                    case 'lnkUpload':
                        this.lnkAddress = msgValue;
                        //console.info('lnkUploadMsg:', msgValue);
                        break;
                    case 'tab3click':
                        //console.info('tab3clickMsg:');
                        break;
                    case 'locSearch':
                        this.searchResult = msgValue;
                        //console.info('locSearch:', msgValue);
                        break;
                    case 'insertConfirm':
                        this.insertLoc = msgValue;
                        //console.info('insertLoc:', msgValue);
                        break;
                    case 'htmlSubmit':
                        this.htmlcontent = msgValue;
                        this.jsoncontent = this.parseHtml(msgValue);
                        //console.info('htmlSubmitMsg:', msgValue, this.jsoncontent);
                        break;
                    case 'jscontentUpdate':
                        //console.info('jscontentUpdate:');//message to trigger jscontent data update
                        break;
                    case 'mapUpdate':          //message to trigger map view update
                        this.mapUpdateType = msgValue;
                        //console.info('mapUpdateMsgType:', msgValue);
                        break;
                    case 'realtimeSensorUpdate':    //message to trigger realtimeSensor data update
                        this.sensorUpdateIndex = msgValue;
                        //console.info('sensorUpdateIndex:', msgValue);
                        break;
                    case 'realtimeSensorsUpdate':    //message to trigger realtimeSensors update
                        
                        break;
                }
                this.broadcastItem(msgID);
            }
                
            sharedService.broadcastItem = function(msgID){
                $rootScope.$broadcast(msgID);
            };
            
            sharedService.parseHtml = function(htmlinput){
            
                var jscontents = {locs:'', lnks:''};
                jscontents.locs = new Array();
                jscontents.lnks = new Array();
                var csvFiles = [];
                var sensorSources = [];
                var realtimeSensors = [];
                var csvLocCount = 0; // To count the amount of .locs in csvFiles. The rest are .lnks files.

                locres = htmlinput.match(/<\s*loc.*?>(.*?)<\s*\/\s*loc\s*.*?>/g);
                lnkres = htmlinput.match(/<\s*lnk.*?>(.*?)<\s*\/\s*lnk\s*.*?>/g);
      
                if(locres)//if any <log> tag existed in htmlinput.
                {
                    for(i=0; i<locres.length; i++)
                    {
                        var loc = {tag:'', content:'', src:'', id:'', lat:99999, lng:99999, name:'', type:'', style:'', data:{}, viz:'', filter:''};
                        loc.style = {r:'', fill:'', stroke:'', width:''};
              
                        locstr = locres[i];
                        loc.tag = locstr.match(/<\s*loc.*?>/g) + '</loc>';
                        loc.content = locstr.replace(/<\s*loc.*?>/g,'').replace(/<\s*\/\s*loc\s*.*?>/g,'');

                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);
                        match = myRegex.exec(loc.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=").replace(/\s*:\s*/g,":").replace(/\s*;\s*/g,";");
                       
                        src = attrs.match(/src="([^"]*)"/);
                        id = attrs.match(/id="([^"]*)"/);
                        myname = attrs.match(/name="([^"]*)"/);
                        type = attrs.match(/type="([^"]*)"/);
                        lat = attrs.match(/lat="([0-9/.]*)"/);
                        lng = attrs.match(/lng="([0-9/.]*)"/);
                        viz = attrs.match(/viz="([^"]*)"/);
                        
                        if(lat && lng)
                        {
                            loc.lat = lat[1];
                            loc.lng = lng[1];
                        }
                        if(type)
                        {
                            if(type == "realtime")
                            {
                                if(src)
                                    loc.type = type[1];
                            }
                            else
                                loc.type = type[1];
                        }
                        if(id)loc.id = id[1];
                        if(myname)loc.name = myname[1];
                        if(viz)loc.viz = viz[1];
                        
                        //Process filters
                        if(attrs.match(/filter="([^"]*)"/))
                        {
                            loc.filter= attrs.match(/filter="([^"]*)"/)[1].replace(/\s*,\s*/g,",").match(/[^,]+/g);
                            console.info("loc.filter: ", loc.filter);
                        }
                        
                        //Process loc's style
                        locstyle = attrs.match(/style="([^"]*)"/);
                        if(locstyle)
                        {
                            r = locstyle[1].match(/r:([0-9/.]*);/);
                            fill = locstyle[1].match(/fill:([^;]*);/);
                            stroke = locstyle[1].match(/stroke:([^;]*);/);
                            width = locstyle[1].match(/width:([^;]*);/);
                            if(r)loc.style.r = r[1];
                            if(fill)loc.style.fill = fill[1];
                            if(stroke)loc.style.stroke = stroke[1];
                            if(width)loc.style.width = width[1];
                        }
                   
                        if(src)//If a external data source existed. Either a CSV file or a JSON response from url.
                        {
                            loc.src = src[1];
                            if(loc.src.match(/.locs$/))
                            {
                                console.info("This is a .locs file.");
                                csvFiles.push(loc);
                                csvLocCount++;
                            }
                            else
                            {
                                if(loc.lat == 99999 && loc.lng == 99999)
                                {
                                    loc.lat = "35.554498";
                                    loc.lng = "139.6485728";
                                    alert('To show the data from ' + loc.src +', you need to bind the lat and lng to a pair of fixed coordinates or corresponding keys in dataset. Initial location has been set to (35.554498, 139.6485728).');
                                }
                                if(loc.type == "realtime")
                                {
                                    realtimeSensors.push(loc);
                                }
                                else
                                    sensorSources.push(loc);
                            }
                        }
                        else
                        {
                            id = attrs.match(/id="([^"]*)"/);
                            myname = attrs.match(/name="([^"]*)"/);
                            type = attrs.match(/type="([^"]*)"/);
                            lat = attrs.match(/lat="([0-9/.]*)"/);
                            lng = attrs.match(/lng="([0-9/.]*)"/);

                            if(type)loc.type = type[1];
                            if(id)loc.id = id[1];
                            if(myname)loc.name = myname[1];
                            if(lat)loc.lat = lat[1];
                            if(lng)loc.lng = lng[1];
                            
                            jscontents.locs.push(loc);
                        }
                    }
                }   
     
                if(lnkres)//if any <lnk> tag existed in html input.
                {
                    for(i=0; i<lnkres.length; i++)
                    {
                        var lnk = {tag:'', content:'', src:'', id:'', points:'', category:'', style:''};
                        lnk.points = [];
                        lnk.style = {type:'', fill:'', stroke:'', width:''};
            
                        lnkstr = lnkres[i];
                        lnk.tag = lnkstr.match(/<\s*lnk.*?>/g) + '</lnk>';
                        lnk.content = lnkstr.replace(/<\s*lnk.*?>/g,'').replace(/<\s*\/\s*lnk\s*.*?>/g,'');
                        
                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);
                        match = myRegex.exec(lnk.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=").replace(/\s*,\s*/g,",").replace(/\s*:\s*/g,":").replace(/\s*;\s*/g,";");
                        src = attrs.match(/src="([^"]*)"/);
            
                        lnkstyle = attrs.match(/style="([^"]*)"/);
                        if(lnkstyle)
                        {
                            lnktype = lnkstyle[1].match(/type:([^;]*);/);
                            fill = lnkstyle[1].match(/fill:([^;]*);/);
                            stroke = lnkstyle[1].match(/stroke:([^;]*);/);
                            width = lnkstyle[1].match(/width:([^;]*);/);
                            
                            if(lnktype)lnk.style.type = lnktype[1];
                            if(fill)lnk.style.fill = fill[1];
                            if(stroke)lnk.style.stroke = stroke[1];
                            if(width)lnk.style.width = width[1];
                        }
            
                        if(src)//Processing .csv file with address "src".
                        {
                            lnk.src = src[1];
                            csvFiles.push(lnk);
                        }
                        else
                        {
                            id = attrs.match(/id="([^"]*)"/);
                            category = attrs.match(/category="([^"]*)"/);
                            temps = attrs.match(/points="([^"]*)"/);
                            lnk.points = temps[1].split(/[,]+/);
                             
                            if(id)lnk.id = id[1];
                            if(category)lnk.category = category[1];
                            jscontents.lnks.push(lnk);
                        }
                    }
                }
     
                
                function isAmongKeys(testString, keys)
                {//This function checks whether a string is among the dataset keys.
                        for(var index=0; index<keys.length; index++)
                        {
                            if(testString == keys[index])
                            return true;
                        }
                        return false;
                }
                
                function createFilters(targetContent, keys)
                {
                    var testStrings = targetContent.replace(/\s*/g, '').split(/[,]+/);
                    var targetFilters = [];
                    for(var k=0; k<testStrings.length; k++)
                    {
                        if(testStrings[k].match(/data\.(\w+)/))
                        {//Check if the filter is a valid key in dataset.
                            var testString = testStrings[k].replace(/data./, '');
                            if(isAmongKeys(testString, keys))
                            targetFilters.push(testString);
                            else
                                alert('Can not find a key named: '+testString+' in the dataset! Please check!');
                        }
                        else
                            alert('Filter: '+testStrings[k]+' is Not Correct! Must be like:"data.FILTERNAME".');        
                    }
                    return targetFilters;
                }
                
                function createHTMLContent(keysToShow, dataSource)
                {// This function create a full HTML content from datasource 
                 // using given filters.
                    var htmlContent = '';    
                        
                    htmlContent = '<div><table><thead><tr>';
                    for(var x=0; x<keysToShow.length; x++)
                        htmlContent += '<th>' + keysToShow[x] + '</th>';
                    htmlContent += '</tr></thead>' + '<tbody>';
                    if(dataSource.constructor === Array)
                    {
                        for(var y=0; y<dataSource.length && y<20; y++)
                        {
                            htmlContent.content += '<tr>';
                            for(var z=0; z<keysToShow.length; z++)
                            {
                                var key = keysToShow[z];
                                htmlContent += '<td>' + dataSource[y][key] + '</td>';
                            }
                            htmlContent += '</tr>';
                        }
                    }
                    else //if dataSource is an Object, then the length will become undefined.
                    {
                        htmlContent.content += '<tr>';
                        angular.forEach(keysToShow, function(key){
                            htmlContent += '<td>' + dataSource[key] + '</td>';
                        });
                        htmlContent += '</tr>';
                    }
                    htmlContent += '</tbody></table></div>'; 
                    return htmlContent;
                }
                
                function createRealtimeContent(index)
                {// This function create a full HTML content from realtime datasource 
                 // using given index of realtimeSensors array.
                    var htmlContent = '';    
                        
                    htmlContent = '<div><table><thead><tr>';
                    for(var x=0; x<realtimeSensors[index].data.filters.length; x++)
                        htmlContent += '<th>{{realtimeSensors['+index+'].data.filters['+x+']}}</th>';
                    htmlContent += '</tr></thead>' + '<tbody>';
                    htmlContent.content += '<tr>';
                    for(var x=0; x<realtimeSensors[index].data.filters.length; x++)
                        htmlContent += '<td>{{realtimeSensors['+index+'].data.message[realtimeSensors['+index+'].data.filters['+x+']]}}</td>';
                    htmlContent += '</tr>';
                    htmlContent += '</tbody></table></div>'; 
                    return htmlContent;
                }
                
                if(realtimeSensors)
                {
                    console.info('realtimeSensors:,', realtimeSensors);
                    sharedService.realtimeSensors = realtimeSensors;
                    //sharedService.prepForBroadcast('realtimeSensorsUpdate', '');  //send message to update jsoncontent in mapCtrl
                    //sharedService.prepForBroadcast('mapUpdate', 'all'); //send message to update map view
                    /*
                    for(var l=0; l<realtimeSensors.length;l++)
                    {
                        
                        realtimeSensors[l].data = new EventSource(realtimeSensors[l].src);
                        realtimeSensors[l].data.index = l;
                        realtimeSensors[l].data.filters = [];
                        realtimeSensors[l].data.keys = [];
                        realtimeSensors[l].data.message = '';
                        realtimeSensors[l].data.firstTime = true;
                        realtimeSensors[l].data.realtime = true;
                    }
                    
                    function messageProcess(rawMessage)
                    {
                        var tempMessage = JSON.parse(rawMessage.replace(/-/g, ''));
                        return JSON.parse(tempMessage.message);
                    }
                    
                    angular.forEach(realtimeSensors, function(realtimeSensor){
                        realtimeSensor.data.onmessage = function(event){
                            realtimeSensor.data.message = messageProcess(event.data);
                            realtimeSensor.data.keys = Object.keys(realtimeSensor.data.message);
                            
                            if(realtimeSensor.data.firstTime)    //first time to recieve sensor data, update data and construct html to be shown in d3 tooltip accordingly
                            {
                                
                                if(realtimeSensor.content)
                                    realtimeSensor.data.filters = createFilters(realtimeSensor.content, realtimeSensor.data.keys);
                                if(realtimeSensor.data.filters.length == 0)
                                    realtimeSensor.data.filters = realtimeSensor.data.keys;
                                realtimeSensor.content = createRealtimeContent(realtimeSensor.data.index);
                                
                                jscontents.locs.push(realtimeSensor);
                                
                                sharedService.prepForBroadcast('realtimeSensorUpdate', realtimeSensor.data.index);//send message to update sensor data
                                sharedService.prepForBroadcast('jscontentUpdate', '');  //send message to update jsoncontent in mapCtrl
                                sharedService.prepForBroadcast('mapUpdate', 'mapView'); //send message to update map view
                                
                                realtimeSensor.data.firstTime = false;   //change firstTime flag to false
                            }
                            else    //not first time, update data only
                            {
                                sharedService.prepForBroadcast('realtimeSensorUpdate', realtimeSensor.data.index);
                            }
                            
                            
                            //sharedService.prepForBroadcast('jscontentUpdate', '');  
                            //sharedService.prepForBroadcast('mapUpdate', 'd3');
                            //console.info("Realtime HTML contents: ", realtimeSensor.content);
                        }
                    });
                    sharedService.realtimeSensors = realtimeSensors;
                    */
                }
                
                if(sensorSources)
                {
                    var urlCalls = [];
                    
                    angular.forEach(sensorSources, function(sensorSource){
                        urlCalls.push($http.get(sensorSource.src));
                    });
                    
                    $q.all(urlCalls)
                    .then(
                        function(results){
                            for(var i=0;i<results.length && results[i].data;i++)
                            {
                                var keys = Object.keys(results[i].data[0]); //Get all the keys of the dataset.
                                var filters = []; //Get all the filters through loc.content.
                             
                                    
                                // Recognize and create filters.
                                if(sensorSources[i].content)
                                    filters = createFilters(sensorSources[i].content, keys);
                                    
                                //Process lat & lng.
                                if(sensorSources[i].lat.match(/data\.(\w+)/) && sensorSources[i].lng.match(/data\.(\w+)/))
                                {
                                    //if lat & lng match "data.KEY" format.
                                    var latKey = sensorSources[i].lat.replace(/data./, '');
                                    var lngKey = sensorSources[i].lng.replace(/data./, '');
                                    var data = results[i].data;
                                    
                                    if(isAmongKeys(latKey, keys) && isAmongKeys(lngKey, keys))
                                    {
                                        for(var j=0; j<data.length && j<20; j++)
                                        {
                                            var newloc = {tag: sensorSources[i].tag, content:'', src: sensorSources[i].src, name: sensorSources[i].name, id: sensorSources[i].id, type: sensorSources[i].type, lat: data[j][latKey], lng: data[j][lngKey], data:[], style:{r:sensorSources[i].style.r, fill: sensorSources[i].style.fill, stroke: sensorSources[i].style.stroke, width: sensorSources[i].style.width}};
                                            newloc.data.push(data[j]);
                                            if(filters.length != 0)
                                                newloc.content = createHTMLContent(filters, newloc.data);
                                            else
                                                newloc.content = createHTMLContent(keys, newloc.data);
                                            jscontents.locs.push(newloc);
                                        }
                                    }
                                    else
                                        alert('Appointed lat key and lng key do not exist in current dataset. Please check!');
                                }
                                else if(sensorSources[i].lat.match(/[0-9/.]*/) && sensorSources[i].lng.match(/[0-9/.]*/))
                                {//If lat & lng match number format, i.e. fixed coordinates.
                                    sensorSources[i].data = results[i].data;
                                    if(filters.length != 0)
                                        sensorSources[i].content = createHTMLContent(filters, sensorSources[i].data);
                                    else
                                        sensorSources[i].content = createHTMLContent(keys, sensorSources[i].data);
                                    jscontents.locs.push(sensorSources[i]);
                                }
                                else
                                {
                                    loc.lat = "35.554498";
                                    loc.lng = "139.6485728";
                                    alert('Invalid lat and lng format. Location reset to (35.554498, 139.6485728)!');
                                }
                            }
                            
                            //send message to update jscontent in mapCtrl and update boundingbox of map view
                            //here we don't need to update all, because update boundingbox will automatically update d3
                            sharedService.prepForBroadcast('jscontentUpdate', '');  
                            sharedService.prepForBroadcast('mapUpdate', 'mapView'); //revised by wu2
                    });         
                }
                
                if(csvFiles)//To process all the .locs & .lnks csv files.
                {
                    var q = queue();
                    for(var i=0; i<csvFiles.length; i++)
                        q.defer(d3.csv, csvFiles[i].src);
                        
                    q.await(onDataLoaded);
                        
                    function onDataLoaded(error)
                    {
                        for(var i=1; i<arguments.length; i++)
                        {
                            var index = i-1;
                            //Since arguments[0] = null;so arguments[1] is corresponding to csvFiles[0]'s result.
                            for(var j=0; i < csvLocCount + 1 && j < arguments[i].length; j++)//if is .locs file
                            {
                                var newloc = {tag:csvFiles[index].tag, content:csvFiles[index].content, src:csvFiles[index].src, id:arguments[i][j].id, lat:arguments[i][j].lat, lng:arguments[i][j].lng, name:arguments[i][j].name, type:arguments[i][j].type, data:csvFiles[index].data, style:{r:csvFiles[index].style.r, fill:csvFiles[index].style.fill, stroke:csvFiles[index].style.stroke, width:csvFiles[index].style.width}};
                                jscontents.locs.push(newloc);
                            }
                            for(var k=0; i >= csvLocCount + 1 && k < arguments[i].length; k++)//if is .lnks file
                            {
                                //var temp = arguments[i][k].points.split(/[,]+/);//To split points string into an array by ","
                                var newlnk = {tag:csvFiles[index].tag, content:csvFiles[index].content, src:csvFiles[index].src, id:arguments[i][k].id, points:arguments[i][k].points.split(/[,]+/), category:arguments[i][k].category, style:{type:csvFiles[index].style.type, fill:csvFiles[index].style.fill, stroke:csvFiles[index].style.stroke, width: csvFiles[index].style.width}};
                                jscontents.lnks.push(newlnk);
                            }
                        }
             
                        if(jscontents.lnks && jscontents.locs)
                        {
                            for(var i=0;i<jscontents.lnks.length;i++)
                            {
                                for(var j=0;j<jscontents.lnks[i].points.length;j++)
                                {
                                    for(var k=0;k<jscontents.locs.length;k++)
                                    {
                                        if(jscontents.lnks[i].points[j] == jscontents.locs[k].name)
                                        {
                                            var newPoint = {name:jscontents.lnks[i].points[j], lat:jscontents.locs[k].lat, lng:jscontents.locs[k].lng};
                                            jscontents.lnks[i].points[j] = newPoint;
                                        }
                                    }
                                }
                            }
                        }
                        
                        //sharedService.prepForBroadcast('jscontentUpdate', '');  
                        sharedService.prepForBroadcast('mapUpdate', 'mapView'); //revised by wu2
                    }
                }
    
                console.info("new jscontents:", jscontents);
                return jscontents;
            };
            
    return sharedService;
});
    
