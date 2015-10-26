angular.module('scheduleAssistant', ['ui.bootstrap','ngAutocomplete','ui.tree','uiGmapgoogle-maps','angularFileUpload','textAngular','google.places']);

/*
angular.module('scheduleAssistant').controller('autoCpltCtrl', function ($scope){
    $scope.result1 = '';
    $scope.option1 = null;
    $scope.details1 = '';
});

angular.module('scheduleAssistant').controller('DatepickerDemoCtrl1', function ($scope, $filter) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };
    
  $scope.change = function(){
    $scope.weekday = $filter('date')($scope.dt, 'EEE');
  };
  $scope.change();
    
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

      
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
});

angular.module('scheduleAssistant').controller('DatepickerDemoCtrl2', function ($scope, $controller){
    $controller('DatepickerDemoCtrl1', {$scope: $scope});
});

angular.module('scheduleAssistant').controller('TimepickerDemoCtrl1', function ($scope, $log) {

  $scope.mytime = new Date();
    
  function initialize(){
    $scope.mytime.setHours();
    $scope.mytime.setMinutes();
  }
  initialize();  
  
  $scope.hstep = 1;
  $scope.mstep = 1;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = false;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };
});

angular.module('scheduleAssistant').controller('TimepickerDemoCtrl2', function ($scope, $controller){
    $controller('TimepickerDemoCtrl1', {$scope: $scope});
});

angular.module('scheduleAssistant').controller('treeCtrl', function($scope) {
    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function(scope) {
      scope.toggle();
    };

    $scope.moveLastToTheBeginning = function () {
      var a = $scope.data.pop();
      $scope.data.splice(0,0, a);
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        nodes: []
      });
    };

    $scope.collapseAll = function() {
      $scope.$broadcast('collapseAll');
    };

    $scope.expandAll = function() {
      $scope.$broadcast('expandAll');
    };

    $scope.data = [{
      "id": 1,
      "title": "node1",
      "nodes": [
        {
          "id": 11,
          "title": "node1.1",
          "nodes": [
            {
              "id": 111,
              "title": "node1.1.1",
              "nodes": []
            }
          ]
        },
        {
          "id": 12,
          "title": "node1.2",
          "nodes": []
        }
      ],
    }, {
      "id": 2,
      "title": "node2",
      "nodes": [
        {
          "id": 21,
          "title": "node2.1",
          "nodes": []
        },
        {
          "id": 22,
          "title": "node2.2",
          "nodes": []
        }
      ],
    }, {
      "id": 3,
      "title": "node3",
      "nodes": [
        {
          "id": 31,
          "title": "node3.1",
          "nodes": []
        }
      ],
    }];
    
  });
*/

angular.module('scheduleAssistant').controller('mapCtrl', ['$scope', 'mySharedService',
function($scope, sharedService){
    
    $scope.map = {
        center: {latitude: 35.554498, longitude: 139.6485728},
        zoom: 14,
    };
    
    $scope.jsoncontent = '';
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
    
/*    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            $scope.$apply(function(){
                $scope.map = {center: {latitude: position.coords.latitude, longitude: position.coords.longitude}, zoom: 14 };
                $scope.options = {scrollwheel: true};
                
                console.log("----------position---------");
                console.log(position);
            });
        });
    };*/
    
    $scope.$on('htmlSubmit', function(){
       console.info('mapCtrl','htmlSubmit');
       $scope.jsoncontent = sharedService.jsoncontent;
       console.info('jsoncontent:',$scope.jsoncontent);
       
       var map = window.anMap;
       console.info('map',map);
        
       if($scope.jsoncontent.locs)
       {
           var averLat = 0;
           var averLng = 0;
           for(var i=0; i<$scope.jsoncontent.locs.length; i++)
           {
               averLat = averLat + parseFloat($scope.jsoncontent.locs[i].lat);
               averLng = averLng + parseFloat($scope.jsoncontent.locs[i].lng);
           }
           
           averLat = averLat / $scope.jsoncontent.locs.length;
           averLng = averLng / $scope.jsoncontent.locs.length;
           //console.info("Average Lat & Lng: ", averLat, averLng);
           $scope.map.center.latitude = averLat;
           $scope.map.center.longitude = averLng;
           //console.info("Map Center: ", $scope.map.center);
       }

        
       if(d3.select("div.SvgOverlay"))
       {
           d3.select("div.SvgOverlay").remove();
       }
       if(overlay)
       {
           overlay.setMap(null);
       }
       
       var overlay = new google.maps.OverlayView();
       overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
                .attr("class", "SvgOverlay");
            var svg = layer.append("svg");
            var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
            var adminDivisions = svg.append("g").attr("class", "AdminDivisions");
            var lineGroup = svg.append("g").attr("class", "lines");
            var locGroup = svg.append("g").attr("class", "locs");
           
           overlay.draw = function(){
                var projection = this.getProjection(),
                    //padding = 16;
                    locs = $scope.jsoncontent.locs,
                    lnks = $scope.jsoncontent.lnks;
                  
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
                    .data(locs)
                    .each(transform)
                    .attr({
                        cx: function(d){return d.x;},
                        cy: function(d){return d.y;},
                        r: function(d){if(d.style.r)return d.style.r; else return 10;}
                    })
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "red";})
                    .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "lightblue";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "1px";})
                    .enter().append("circle")
                    .each(transform)
                    .attr({
                        cx: function(d){return d.x;},
                        cy: function(d){return d.y;},
                        r: function(d){if(d.style.r)return d.style.r; else return 10;}
                    })
                    .style("stroke", function(d){if(d.style.stroke)return d.style.stroke; else return "red";})
                    .style("fill", function(d){if(d.style.fill)return d.style.fill; else return "lightblue";})
                    .style("stroke-width", function(d){if(d.style.width)return d.style.width; else return "1px";})
                    .on("mouseover", function(d){
                        tooltip.transition()
                            .duration(200)
                            .style("opacity",.9);
                            tooltip.html(d.content)
                                .style("left", (d3.event.pageX + 5) + "px")
                                .style("top", (d3.event.pageY - 28)+ "px");
                    })
                    .on("mouseout", function(d){
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
               
               function transform(loc){
                    var googleCoordinates = new google.maps.LatLng(loc.lat, loc.lng);
                    var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
                   loc.x = pixelCoordinates.x + 4000;
                   loc.y = pixelCoordinates.y + 4000;
                   
                   //console.info("loc in transform:", loc, loc.x, loc.y);
                    return loc;
               };
               
               function transformGroups(lnk)
               {
                   for(var i=0;i<lnk.points.length;i++)
                   {
                       var googleCoordinates = new google.maps.LatLng(lnk.points[i].lat, lnk.points[i].lng);
                        var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
                        lnk.points[i].x = pixelCoordinates.x + 4000;
                        lnk.points[i].y = pixelCoordinates.y + 4000;
                   }
                   //console.info("lnkPoints in transform:", lnk);
                   return lnk;
               }
       };
       
 
   };
       
    overlay.setMap(map); 
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
		$scope.orightml = '<h2>Try me!</h2><p><lnk id="1" points=" keio university, #,  dhifes, 1234 " category="subway">This is a testing link.</lnk></p><p><lnk id="2" points="1234, #" style=" stroke: black; width: 3px; type : dotted;">This is another testing link.</lnk></p><p><loc name="1234" lat="35.57" lng="139.66" style="r:15;  fill: red; stroke : black; width: 5px;"></loc></p><p><loc type = \' university.1.~$!@#^&%*()-= \' id = "中文" lat="35.554498 " lng="139.6485728" name ="keio university">textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</loc></p><p><loc lat="35.55129247928427" lng="139.671764373779" name="#"></loc></p><p><loc name="dhifes" lat="35.58" lng="139.66"></loc></p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn\'t Use an iFrame</li><li>Works with Firefox, Chrome, and IE8+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p><p><loc src="https://data.melbourne.vic.gov.au/resource/ez6b-syvw.json"></loc></p>';
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
            sharedService.prepForBroadcast('htmlSubmit', $scope.htmlcontent);
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
    function($rootScope, $http){
            var sharedService = {};
                
            sharedService.imgAddress = '';
            sharedService.htmlcontent = '';
            sharedService.jsoncontent = '';
            sharedService.locAddress = '';
            sharedService.lnkAddress = '';
            sharedService.searchResult = null;
            sharedService.insertLoc = null;
    
            sharedService.prepForBroadcast = function(msgID, msgValue){
                switch(msgID)
                {
                    case 'imgUpload':
                        this.imgAddress = msgValue;
                        console.info('imgUploadMsg:', msgValue);
                        break;
                    case 'locUpload':
                        this.locAddress = msgValue;
                        console.info('locUploadMsg:', msgValue);
                        break;
                    case 'lnkUpload':
                        this.lnkAddress = msgValue;
                        console.info('lnkUploadMsg:', msgValue);
                        break;
                    case 'tab3click':
                        console.info('tab3clickMsg:');
                        break;
                    case 'locSearch':
                        this.searchResult = msgValue;
                        console.info('locSearch:', msgValue);
                        break;
                    case 'insertConfirm':
                        this.insertLoc = msgValue;
                        console.info('insertLoc:', msgValue);
                        break;
                    case 'htmlSubmit':
                        this.htmlcontent = msgValue;
                        this.jsoncontent = this.parseHtml(msgValue);
                        console.info('htmlSubmitMsg:', msgValue, this.jsoncontent);
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
                var csvLocCount = 0; // To count the amount of .locs in csvFiles. The rest are .lnks files.

                locres = htmlinput.match(/<\s*loc.*?>(.*?)<\s*\/\s*loc\s*.*?>/g);
                lnkres = htmlinput.match(/<\s*lnk.*?>(.*?)<\s*\/\s*lnk\s*.*?>/g);
      
                if(locres)//if any <log> tag existed in htmlinput.
                {
                    for(i=0; i<locres.length; i++)
                    {
                        var loc = {tag:'', content:'', src:'', id:'', lat:0, lng:0, name:'', type:'', style:'', data:''};
                        loc.style = {r:'', fill:'', stroke:'', width:''};
              
                        locstr = locres[i];
                        loc.tag = locstr.match(/<\s*loc.*?>/g) + '</loc>';
                        loc.content = locstr.replace(/<\s*loc.*?>/g,'').replace(/<\s*\/\s*loc\s*.*?>/g,'');

                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);
                        match = myRegex.exec(loc.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=").replace(/\s*:\s*/g,":").replace(/\s*;\s*/g,";");
                       
                        src = attrs.match(/src="([^"]*)"/);
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
                            {//Following the processing of JSON response.
                                 lat = attrs.match(/lat="([^"]*)"/);
                                 lng = attrs.match(/lng="([^"]*)"/);
                                 
                                 if(lat && lng)
                                 {
                                     if(lat[1].match(/data\.(\w+)/) && lng[1].match(/data\.(\w+)/))
                                     {//If user defines lat and lng from JSON data source.
                                         $http.get(loc.src).success(function(data){
                                             if(data)
                                             {
                                                 var latKey = lat[1].replace(/data./, '');
                                                 var lngKey = lng[1].replace(/data./, '');
                                                 var keys = Object.keys(data[0]);
                                                 
                                                 for(var i=0; i<data.length && i<20; i++)
                                                 {//Read each row of data and write into loc.content
                                                    loc.content = '<div><table><thead><tr>';
                                                    for(var j=0; j<keys.length; j++)
                                                        loc.content += '<th>' + keys[j] + '</th>';
                                                    loc.content += '</tr></thead>' + '<tbody><tr>';
                                                    for(var k=0; k<keys.length; k++)
                                                    {
                                                        var key = keys[k];
                                                        loc.content += '<td>' + data[i][key] + '</td>';
                                                    }
                                                    loc.content += '</tr></tbody></table></div>';
                                                    var newloc = {tag: loc.tag, content: loc.content, src: loc.src, name: loc.name, id: loc.id, type: loc.type, lat: data[i][latKey], lng: data[i][lngKey], data:data[i], style:{r:loc.style.r, fill: loc.style.fill, stroke: loc.style.stroke, width: loc.style.width}}; 
                                                    console.info(newloc);
                                                    jscontents.locs.push(newloc);
                                                 }
                                             }
                                             else
                                                alert("Can not get the data source from "+loc.src);
                                         });
                                         
                                     }
                                     else if(lat[1].match(/[0-9/.]*/) && lng[1].match(/[0-9/.]*/))
                                     {//IF user defines lat and lng as a fixed absolute coords.
                                         loc.lat = lat[1];
                                         loc.lng = lng[1];
                                         
                                         $http.get(loc.src).success(function(data){
                                            if(data)
                                            {
                                                loc.data = data;
                                                var keys = Object.keys(loc.data[0]);
                                                if(loc.content)
                                                {//If user define filters useing content, like "data.timestamp".
                                                    var temps = loc.content.replace(/\s*/g, '').split(/[,]+/);
                                                    var filters = [];
                                                    for(var i=0; i<temps.length; i++)
                                                    {
                                                        if(temps[i].match(/data\.(\w+)/))
                                                        {//Check if the filter is a valid key in dataset.
                                                            var temp = temps[i].replace(/data./, '');
                                                            var j = 0;
                                                        
                                                            for(; j<keys.length; j++)
                                                            {
                                                                if(temp == keys[j])
                                                                {
                                                                    filters.push(temp);
                                                                    break;
                                                                }
                                                            }
                                                            if(j == keys.length)
                                                                alert('Can not find a key named: '+temp+' in the dataset! Please check!');
                                                        }
                                                        else
                                                            alert('Filter: '+temps[i]+' is Not Correct! Must be like:"data.FILTERNAME".');       
                                                    }
                                                    if(filters.length != 0)
                                                    {//Write data into loc.content using filtered keys.
                                                        console.info("Filters:", filters);
                                                        loc.content = '<div><table><thead><tr>';
                                                        for(var x=0; x<filters.length; x++)
                                                            loc.content += '<th>' + filters[x] + '</th>';
                                                        loc.content += '</tr></thead>' + '<tbody>';
                                                        for(var y=0; y<loc.data.length && y<13; y++)
                                                        {
                                                            loc.content += '<tr>';
                                                            for(var z=0; z<filters.length; z++)
                                                            {
                                                                var key = filters[z];
                                                                loc.content += '<td>' + loc.data[y][key] + '</td>';
                                                            }
                                                            loc.content += '</tr>';
                                                        }
                                                        loc.content += '</tbody></table></div>';
                                                        jscontents.locs.push(loc);      
                                                    }
                                                    else
                                                    {//If there is no filter or all invalid filter, then show all the data.
                                                        loc.content = '<div><table><thead><tr>';
                                                        for(var x=0; x<keys.length; x++)
                                                        loc.content += '<th>' + keys[x] + '</th>';
                                                        loc.content += '</tr></thead>' + '<tbody>';
                                                        for(var y=0; y<loc.data.length && y<13; y++)
                                                        {
                                                            loc.content += '<tr>';
                                                            for(var z=0; z<keys.length; z++)
                                                            {
                                                                var key = keys[z];
                                                                loc.content += '<td>' + loc.data[y][key] + '</td>';
                                                            }
                                                            loc.content += '</tr>';
                                                        }
                                                        loc.content += '</tbody></table></div>'; 
                                                        jscontents.locs.push(loc);
                                                    }
                                                }
                                                else
                                                {//There is no filters from loc.content
                                                    loc.content = '<div><table><thead><tr>';
                                                    for(var i=0; i<keys.length; i++)
                                                        loc.content += '<th>' + keys[i] + '</th>';
                                                    loc.content += '</tr></thead>' + '<tbody>';
                                                    for(var j=0; j<loc.data.length && j<13; j++)
                                                    {
                                                        loc.content += '<tr>';
                                                        for(var k=0; k<keys.length; k++)
                                                        {
                                                            var key = keys[k];
                                                            loc.content += '<td>' + loc.data[j][key] + '</td>';
                                                        }
                                                        loc.content += '</tr>';
                                                    }
                                                    loc.content += '</tbody></table></div>';
                                                    console.info("loc.content: ", loc.content);
                                                    jscontents.locs.push(loc);
                                                }
                                            }
                                            else
                                                alert("Can not get the data source from "+loc.src);
                                         });
                                         
                                     }
                                 }
                                 else
                                 {
                                     console.info("There is no lat && lng!");
                                 } 
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
                                var newloc = {tag:csvFiles[index].tag, content:csvFiles[index].content, src:csvFiles[index].src, id:arguments[i][j].id, lat:arguments[i][j].lat, lng:arguments[i][j].lng, name:arguments[i][j].name, type:arguments[i][j].type, style:{r:csvFiles[index].style.r, fill:csvFiles[index].style.fill, stroke:csvFiles[index].style.stroke, width:csvFiles[index].style.width}};
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
                    }
                }
    
                console.info("new jscontents:", jscontents);
                return jscontents;
            };
            
    return sharedService;
});
    
