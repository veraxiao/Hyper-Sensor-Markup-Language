angular.module('starter.controllers', ['uiGmapgoogle-maps'])

.controller('DashCtrl', function($scope, $rootScope, mySharedService) {

    $scope.html = mySharedService.get().htmlcontent;
    
    
})

.controller('ChatsCtrl', function($scope, $compile, $window, mySharedService, uiGmapIsReady) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    $scope.map = {
        center: {latitude: 36.571475, longitude: 138.20057199999997},
        zoom: 14,
        control: {},
        options: {clickableIcons: false},
    };
    
    $scope.data = mySharedService.get().jsoncontent;
    $scope.locs = new Array();
    $scope.lnks = $scope.data.lnks;
    //$scope.tooltip = d3.select("body")
    //                .append("div")
    //                .attr("class", "tooltip")
    //                .style("opacity", 0);
    
    $scope.tooltips = new Array();
    
    for(i=0;i<$scope.data.locs.length;i++)
    {
        if($scope.data.locs[i].lat != 99999 && $scope.data.locs[i].lng != 99999)
            $scope.locs.push($scope.data.locs[i]);
    }
    
    for(j=0;j<$scope.locs.length;j++)
    {
        if($scope.locs[j].type == "realtime")
        {
            var socket = {
                listener: io.connect($scope.locs[j].src),
                index: j,
            };
            
            $scope.tooltips[j] = d3.select("body")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);
            
            socket.listener.on('push', function(data){
                    d = JSON.parse(data);
                    keys = Object.keys(d);
                    //console.info(keys, values);
                
                    $scope.locs[this.index].content = "<div>";
                    for(i=0;i<keys.length;i++)
                    {
                        key = keys[i];
                        $scope.locs[this.index].content = $scope.locs[this.index].content + key + ": " + d[key] + "<br>";  
                    }
                    $scope.locs[this.index].content += "</div>";
                
                   //console.info($scope.locs[this.index].content); 
                    $scope.tooltips[this.index].html($scope.locs[this.index].content);
                    $scope.$apply();}.bind(socket));
        }
    }
    
    
    
    uiGmapIsReady.promise()
    .then(function (map_instances){
        $scope.mapInstance = $scope.map.control.getGMap();
        $scope.mapInstance.addListener('bounds_changed', function(){
        for(i = 0; i<$scope.tooltips.length; i++)
            $scope.tooltips[i].style("opacity", 0);    
        });
        if($scope.data)
        {
        //$scope.updateMapView();
            //console.info("window height:", $window.innerHeight);
            document.getElementsByClassName("angular-google-map-container")[0].style.height = $window.innerHeight - 90 + "px";
            google.maps.event.trigger($scope.mapInstance, 'resize');
            //$scope.mapInstance.setCenter(new google.maps.LatLng(36.571475,138.20057199999997));
            if($scope.locs)
            {
                var averLat = 0;
                var averLng = 0;
                for(var i=0; i<$scope.locs.length; i++)
                {
                averLat = averLat + parseFloat($scope.locs[i].lat);
                averLng = averLng + parseFloat($scope.locs[i].lng);
                }
           
                averLat = averLat / $scope.locs.length;
                averLng = averLng / $scope.locs.length;
            //console.info("Average Lat & Lng: ", averLat, averLng);
            //$scope.map.center.latitude = averLat;
            //$scope.map.center.longitude = averLng;
           //console.info("Map Center: ", $scope.map.center);
                $scope.mapInstance.setCenter(new google.maps.LatLng(averLat,averLng));
            }
            $scope.updateMapView();
            $scope.updateD3();
        }
    });
    
    //$scope.searchResult = null; 
    
    
      
    
    $scope.updateMapView = function()
    {
        if($scope.locs){
            var locs = $scope.locs;
            var bounds = new google.maps.LatLngBounds();
            for(var i=0; i<locs.length; i++)
            {
                var point = new google.maps.LatLng(locs[i].lat, locs[i].lng);
                bounds.extend(point);
            }
            $scope.mapInstance.fitBounds(bounds);
        }
    }
    
    $scope.updateD3 = function()
    {
        var map = $scope.mapInstance;
       
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
            var adminDivisions = svg.append("g").attr("class", "AdminDivisions");
            var lineGroup = svg.append("g").attr("class", "lines");
            var locGroup = svg.append("g").attr("class", "locs");
            
            
            overlay.draw = function()
            {
                var projection = this.getProjection();
                    //padding = 16;
                    //locs = $scope.jsoncontent.locs,
                    //lnks = $scope.jsoncontent.lnks;
                  
               //draw lnks
                var linefunction = d3.svg.line()
                    .x(function(d) {return d.cx;})
                    .y(function(d) {return d.cy;})
                    .interpolate("cadinal");
               
                lineGroup.selectAll("path").remove();
                //for(var i=0; i<lnks.length; i++)
                //{
                var lnkMarkers = lineGroup.selectAll("path")
                    .data($scope.lnks)
                    .enter().append("path")
                    .each(transformGroups)
                    .attr("d", function(d){return linefunction(d.points);})
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "purple";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "2px";})
                    .style("fill",function(d){if(d.style.fill)return d.style.fill; else return "none";})
                    .on("mouseover", function(d,i){
                        $scope.tooltips[i].transition()
                        .duration(200)
                        .style("opacity",.9);
                        $scope.tooltips[i].html(d.content)
                        .style("left",(d3.event.pageX + 5) + "px")
                        .style("top",(d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d,i){
                        $scope.tooltips[i].transition()
                        .duration(200)
                        .style("opacity",0);
                    });
               //console.info("lnkMarkers:", lnkMarkers);
                //}
               
               //draw locs
               //locGroup.selectAll("circle").remove();
               //console.info("locs:", $scope.locs);
               var locMarkers = locGroup.selectAll("circle")
                    .data($scope.locs)
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
                            if(d.content)
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
    
    $scope.$on('$ionicView.beforeLeave', function(){
        for(i = 0; i<$scope.tooltips.length; i++)
            $scope.tooltips[i].style("opacity", 0);
    });

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $window, mySharedService) {
 /* $scope.settings = {
    enableFriends: true
  };*/
    
    
    var mapHeight = $window.innerHeight;
    //var mapWidth = ($window.innerHeight)/ 720 * 492;
    var mapWidth = ($window.innerHeight)/ 900 * 1445;
    console.info("Device H&W: ", mapHeight, mapWidth);
    $scope.data = mySharedService.get().jsoncontent;
    $scope.locs = new Array();
    $scope.lnks = new Array();
    $scope.watchVars = new Array();
    //$scope.tooltips = new Array();
    /* $scope.tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity",0); */
    
    //angular.element(document).ready(function (){

    //});
    
    for(var i=0;i < $scope.data.locs.length; i++)
    {
        if($scope.data.locs[i].x != 99999 && $scope.data.locs[i].y != 99999)
        {
            $scope.locs.push($scope.data.locs[i]);
            /*var tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity",0);
            $scope.tooltips.push(tooltip);*/
        }
    }
    
    for(var i=0; i < $scope.data.lnks.length; i++)
    {//For each lnk record
        var valid = true;
        if($scope.data.lnks[i].fn)
        {// if the function exists 
            for(var j=0; j < $scope.data.lnks[i].fn.length; j++)
            {// for each loc involved in the function
                if(getIndexbyId($scope.data.lnks[i].fn[j].prefix, $scope.locs) == -1)
                    valid = false;     
            }
            if(valid)
                $scope.lnks.push($scope.data.lnks[i]);
            else
                console.log("Invalid lnk.");
        }
        //else if($scope.data.lnks[i].points)
        //console.info("Lnks in controller:", $scope.lnks);
    }
/*    if($scope.locs[0].type == "realtime")
    {
        $scope.socket = io.connect($scope.locs[0].src);
        $scope.socket.on('push', function(data){
            d = JSON.parse(data);
            $scope.locs[0].content = "<div>btAd: "+ d.btAd + ", temp: " + d.temp + "</div>";
            $scope.tooltip.html($scope.locs[0].content);
        });
    }*/
    
    for(var j=0;j < $scope.locs.length; j++)
    {
        if($scope.locs[j].type == "realtime")
        {
            var socket = {
                listener: io.connect($scope.locs[j].src),
                index: j,
            };
            
            socket.listener.on('push', function(data){
                    d = JSON.parse(data);
                    console.info(d);
                    $scope.locs[this.index].content = "<div>Acoustic Noise: "+ d.val_noise +",<br>Temperature: " + d.val_temp + ",<br>Light: " + d.val_light +", <br>Humidity: " + d.val_humi + " </div>";
                d3.select("#tooltip"+this.index).html($scope.locs[this.index].content);
                    $scope.$apply();}.bind(socket));
        }
    }
    
    //create a div for svg
    var divSvg = d3.select("#map").append("div").attr("class", "SvgOverlay2")
                    .attr("width", mapWidth+"px").attr("height", mapHeight+"px");
    var svg = divSvg.append("svg")
                    .attr("width", mapWidth+"px").attr("height", mapHeight+"px");
    //create svg group for map image
    var mapGroup = svg.append("g").attr("class", "map");;
    var mapImg = mapGroup.selectAll("image").data([0])
                    .enter().append("svg:image")
                    .attr("xlink:href", "./img/s02.jpg")
                    .attr("x", "0")
                    .attr("y", "0")
                    .attr("width", mapWidth)
                    .attr("height", mapHeight);
    d3.select("#map").style("width", mapWidth+"px");
    d3.select("#map").style("height", mapHeight+"px");
    
    
    //add tooltip for each sensor
    var tipGroup = svg.append("g").attr("class", "tips");
    var toolTips = tipGroup.selectAll("foreignObject")
                        .data($scope.locs)
                        .attr("x", function(d){return mapWidth * d.x / 100})
                        .attr("y", function(d){return mapHeight * d.y / 100})
                        .attr("width", 335)
                        .attr("height", 800)
                        .enter().append("foreignObject")
                        .attr("x", function(d){return mapWidth * d.x / 100})
                        .attr("y", function(d){return mapHeight * d.y / 100})
                        .attr("width", 335)
                        .attr("height",800)
                        .append("xhtml:body")
                        .append("xhtml:div")
                        .attr("class", "tooltip2")
                        .attr("id", function(d,i){return "tooltip"+i;});
    
    //add circle for each sensor
    var locGroup = svg.append("g").attr("class", "locs");
    var locMarkers = locGroup.selectAll("circle")
                        .data($scope.locs)
                        .attr({   
                            cx: function(d){return (mapWidth * d.x / 100);},
                            cy: function(d){return (mapHeight * d.y / 100);},
                            r: function(d){if(d.style.r)return d.style.r; else return 8;}
                        })
                        .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "black";})
                        .style("stroke-width",function(d){if(d.style.width)return d.style.width; else return 2;})
                        .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "red";})
                        .enter().append("circle")
                        .attr({
                            cx: function(d){return (mapWidth * d.x / 100);},
                            cy: function(d){return (mapHeight * d.y / 100);},
                            r: function(d){if(d.style.r)return d.style.r; else return 8;}
                        })
                        .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "black";})
                        .style("stroke-width",function(d){if(d.style.width)return d.style.width; else return 4;})
                        .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "red";})
                        .on("click", function(d,i) {
                            var tooltip = d3.select("#tooltip"+i);
                            if(tooltip.style("display")!="none")
                            {
                                tooltip.style("display","none");
                                if(d.id == "mobileMic")
                                {
                                    breathingAlgorithm.exit();
                                }
                                if(d.id == "drone")
                                {
                                    $.post(d.src+":1337/land", function(data){console.info("data:", data)});
                                }
                            }
                            else
                            {
                                tooltip.style("display","block");                        
                                if(d.content)
                                    tooltip.html(d.content)
                                    .style("left", (d3.event.pageX + 5) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                else
                                {
                                    if(d.id == "mobileMic")
                                    {
                                        breathingAlgorithm.run({'runjQuery' : true});
                                        tooltip.html("<div>Waiting... Power: 0.</div>")
                                        .style("left", (d3.event.pageX + 5) + "px")
                                        .style("top", (d3.event.pageY - 28) + "px")
                                        .attr("name", "mic");
                                    }
                                    else if(d.id == "drone")
                                    {
                                        $.post(d.src+":1337/takeoff", function(data){console.info("data:", data)});
                                    }
                                    else
                                    {
                                        tooltip.html("<div>Loading...</div>")
                                    .style("left", (d3.event.pageX + 5) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                    }
                                }
                                //console.info("Tooltip:", d3.event.pageX + 5, d3.event.pageY - 28);
                            }
                        })
    
    //Deal with lnks with function attribute
    for(var j=0; j<$scope.lnks.length; j++)
    {
        if($scope.lnks[j].fn)
        {
            switch($scope.lnks[j].fn_name)
            {
                case 'LINEAR':
                    if($scope.lnks[j].fn_parameter.length == 3)
                        linear($scope.lnks[j].fn[0], $scope.lnks[j].fn[1], $scope.lnks[j].fn_parameter[2]);
                    //console.info("This is a linear function!");
                    break;
                case 'IF':
                    console.info("This is an if function!");
                    break;
            }
            
        }
    }

    
    function linear(y, x, slope)
    {
        var index_y = getIndexbyId(y.prefix, $scope.locs);
        var index_x = getIndexbyId(x.prefix, $scope.locs);
        console.info("y, x, slope: ", y, x, slope);
        console.info("index_y, index_x, slope: ", index_y, index_x, slope);

        var watchVar = 'locs[' + index_x + '].' + x.suffix;
        var scopeVar = '$scope.locs[' + index_x + '].' + x.suffix;
        
        if(typeof eval(scopeVar) == 'undefined')
        {
            //eval(scopeVar + '= 0');
            $scope.locs[0].data.pow = 0;
            if($scope.locs[0].data == '')
            {
                var data = {'pow': 0};
                $scope.locs[0].data = data;
            }
            else
            {
                $scope.locs[0].data.pow = 0;
            }
            console.info('scopeVar:', scopeVar, $scope.locs[0]);
        }
        
        //console.info('$scope.watchVars[0]:', $scope.watchVars[0], eval($scope.watchVars[0]));
        $scope.x = 0;
        
        $scope.$watch(watchVar, function(newValue, oldValue){
            console.info('oldValue:',oldValue,';newValue:',newValue);
        });
        
        window.setTimeout(function(){$scope.locs[0].data.pow = 10000; $scope.$apply(); console.info('set value:', $scope.locs[0].data.pow);}, 1000);
        //eval('loc_x.'+ x.suffix)
        
    }
    
    function getIndexbyId(locId, targetLocs){
        if(targetLocs.length != 0)
        {
            for(var i=0; i<targetLocs.length; i++)
            {
                if(targetLocs[i].id == locId)
                    return i;
            }
            console.log("Id "+ locId +" No matched <loc>.");
            return -1; 
        }
        else
        {
            console.log("Loc array does not exist.");
            return -1;
        }
    }
});
