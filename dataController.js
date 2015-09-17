angular.module('scheduleAssistant', ['ui.bootstrap','ngAutocomplete','ui.tree','uiGmapgoogle-maps','angularFileUpload','textAngular']);

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

// Copy all the functions and parameters from controller1 to controller2 
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

// Copy all the functions and parameters from controller1 to controller2 
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

angular.module('scheduleAssistant').controller('mapCtrl', ['$scope', 'mySharedService',
function($scope, sharedService){
    
    $scope.map = {
        center: {latitude: 35.554498, longitude: 139.6485728},
        zoom: 14,
    };
    
    $scope.jsoncontent = '';
    $scope.markers = [];
    
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            $scope.$apply(function(){
                $scope.map = {center: {latitude: position.coords.latitude, longitude: position.coords.longitude}, zoom: 14 };
                $scope.options = {scrollwheel: true};
                
                console.log("----------position---------");
                console.log(position);
            });
        });
    };
    
   $scope.$on('htmlSubmit', function(){
       console.info('mapCtrl','htmlSubmit');
       $scope.jsoncontent = sharedService.jsoncontent;
       console.info('jsoncontent:',$scope.jsoncontent);
       
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
               console.info("lnkMarkers:", lnkMarkers);
                //}
               
               //draw locs
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
                   console.info("lnkPoints in transform:", lnk);
                   return lnk;
               }
       };
       
 
   };
       
    overlay.setMap(map);
      
    $scope.markers = [];
       for(var i=0; i<$scope.jsoncontent.locs.length; i++)
       {
           if($scope.jsoncontent.locs[i].lat && $scope.jsoncontent.locs[i].lng)
           {
               var marker = {
                   latitude: $scope.jsoncontent.locs[i].lat,
                   longitude: $scope.jsoncontent.locs[i].lng,
                   title: $scope.jsoncontent.locs[i].name,
                   content: $scope.jsoncontent.locs[i].content,
                   icon: 'img/push_pin.png',
                   show: false,
                   id: i
               };
               $scope.markers.push(marker);
           }
       }
       
       if($scope.markers.length > 0)
       {
           $scope.map.center = {latitude: $scope.markers[0].latitude,
                                longitude: $scope.markers[0].longitude};
       }
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
		$scope.orightml = '<h2>Try me!</h2><p><lnk id="1" points=" keio university, #,  dhifes, 1234 " category="subway">This is a testing link.</lnk></p><p><lnk id="2" points="1234, #" style=" stroke: black; width: 3px; type : dotted;">This is another testing link.</lnk></p><p><loc name="1234" lat="35.57" lng="139.66" style="r:15;  fill: red; stroke : black; width: 5px;"></loc></p><p><loc type = \' university.1.~$!@#^&%*()-= \' id = "中文" lat="35.554498 " lng="139.6485728" name ="keio university">textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</loc></p><p><loc lat="35.55129247928427" lng="139.671764373779" name="#"></loc></p><p><loc name="dhifes" lat="35.58" lng="139.66"></loc></p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn\'t Use an iFrame</li><li>Works with Firefox, Chrome, and IE8+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p>';
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
    
        $scope.$on('tab3click', function(){
            sharedService.prepForBroadcast('htmlSubmit', $scope.htmlcontent);
        });
    
	};

wysiwygeditor.$inject = ['$scope','mySharedService'];

angular.module('scheduleAssistant').controller('mainCtrl', ['$scope', 'mySharedService', 
    function($scope, sharedService){   

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
    
}]);


//Communication between data controllers.
angular.module('scheduleAssistant').factory('mySharedService', 
    function($rootScope){
            var sharedService = {};
                
            sharedService.imgAddress = '';
            sharedService.htmlcontent = '';
            sharedService.jsoncontent = '';
            sharedService.locAddress = '';
            sharedService.lnkAddress = '';
    
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
            
            sharedService.getLocs = function(htmlstr){
                res = htmlstr.match(/<\s*loc.*?>(.*?)<\s*\/\s*loc\s*.*?>/g);
                
                var locs = new Array();
                if(res)
                {
                    for(i=0; i<res.length; i++)
                    {
                        var loc = {tag:'', content:'', src:'', id:'', lat:0, lng:0, name:'', type:'', style:''};
                        loc.style = {r:'', fill:'', stroke:'', width:''};
                        locstr = res[i];
                        loc.tag = locstr.match(/<\s*loc.*?>/g) + '</loc>';
                        loc.content = locstr.replace(/<\s*loc.*?>/g,'').replace(/<\s*\/\s*loc\s*.*?>/g,'');

                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);

                        match = myRegex.exec(loc.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=").replace(/\s*:\s*/g,":").replace(/\s*;\s*/g,";");
                        console.info("attrs:", attrs);
                        src = attrs.match(/src="([^"]*)"/);
                        if(src)
                            loc.src = src[1];
                        else
                        {
                            console.info("loc's src is Null!");
                            id = attrs.match(/id="([^"]*)"/);
                            myname = attrs.match(/name="([^"]*)"/);
                            type = attrs.match(/type="([^"]*)"/);
                            lat = attrs.match(/lat="([0-9/.]*)"/);
                            lng = attrs.match(/lng="([0-9/.]*)"/);
                            locstyle = attrs.match(/style="([^"]*)"/);
                            if(locstyle)
                            {
                                //console.info("locstyle:",locstyle);
                                r = locstyle[1].match(/r:([0-9/.]*);/);
                                fill = locstyle[1].match(/fill:([^;]*);/);
                                stroke = locstyle[1].match(/stroke:([^;]*);/);
                                width = locstyle[1].match(/width:([^;]*);/);
                                if(r)loc.style.r = r[1];
                                if(fill)loc.style.fill = fill[1];
                                if(stroke)loc.style.stroke = stroke[1];
                                if(width)loc.style.width = width[1];
                                //console.info("loc.style:", loc.style);
                            }

                            if(type)loc.type = type[1];
                            if(id)loc.id = id[1];
                            if(myname)loc.name = myname[1];
                            if(lat)loc.lat = lat[1];
                            if(lng)loc.lng = lng[1];
                            
                             locs.push(loc);
                        }  
                    }
                }
                console.info("locs:", locs);
                return locs;
            }
            
            sharedService.getLnks = function(htmlstr){
                res = htmlstr.match(/<\s*lnk.*?>(.*?)<\s*\/\s*lnk\s*.*?>/g);
                
                var lnks = new Array();
                if(res)
                {
                    for(i=0; i<res.length; i++)
                    {
                        var lnk = {tag:'', content:'', src:'', id:'', points:'', category:'', style:''};
                        lnk.points = [];
                        lnk.style = {type:'', fill:'', stroke:'', width:''};
                        lnkstr = res[i];
                        lnk.tag = lnkstr.match(/<\s*lnk.*?>/g) + '</lnk>';
                        lnk.content = lnkstr.replace(/<\s*lnk.*?>/g,'').replace(/<\s*\/\s*lnk\s*.*?>/g,'');
                        
                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);
                        match = myRegex.exec(lnk.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=").replace(/\s*,\s*/g,",").replace(/\s*:\s*/g,":").replace(/\s*;\s*/g,";");
                        src = attrs.match(/src="([^"]*)"/);
                        if(src)
                            lnk.src = src[1];
                        else
                        {
                            console.info("lnk's src is null!");
                            id = attrs.match(/id="([^"]*)"/);
                            category = attrs.match(/category="([^"]*)"/);
                            temps = attrs.match(/points="([^"]*)"/);
                            lnk.points = temps[1].split(/[,]+/);
                            lnkstyle = attrs.match(/style="([^"]*)"/);
                            if(lnkstyle)
                            {
                                console.info("lnkstyle:",lnkstyle);
                                lnktype = lnkstyle[1].match(/type:([^;]*);/);
                                fill = lnkstyle[1].match(/fill:([^;]*);/);
                                stroke = lnkstyle[1].match(/stroke:([^;]*);/);
                                width = lnkstyle[1].match(/width:([^;]*);/);
                            
                                if(lnktype)lnk.style.type = lnktype[1];
                                if(fill)lnk.style.fill = fill[1];
                                if(stroke)lnk.style.stroke = stroke[1];
                                if(width)lnk.style.width = width[1];
                                //console.info("lnk.style:", lnk.style);
                            }
                            
                        //console.info("temps", temps);            
                        //console.info('points:', lnk.points);
                            if(id)lnk.id = id[1];
                            if(category)lnk.category = category[1];
                            lnks.push(lnk);
                        }  
                    }
                }
                console.info('lnks:', lnks);
                return lnks;
            }
    
            sharedService.parseHtml = function(htmlinput){
                var jscontents = {locs:'', lnks:''};
                jscontents.locs = this.getLocs(htmlinput);
                jscontents.lnks = this.getLnks(htmlinput);
                //console.info("jscontents.lnks before:", jscontents.lnks);
                //finding each corresponding locs in each lnk and store in lnk.points
                if(jscontents.lnks && jscontents.locs)
                {
                    for(var i=0;i<jscontents.lnks.length;i++)
                    {
                        for(var j=0;j<jscontents.lnks[i].points.length;j++)
                        {
                            for(var k=0;k<jscontents.locs.length;k++)
                            {
                                if(jscontents.lnks[i].points[j] == jscontents.locs[k].name)
                                    jscontents.lnks[i].points[j] = jscontents.locs[k];
                            }
                        }
                    }
                }
                //console.info("jscontents.lnks after:", jscontents.lnks);
                
                return jscontents;
            };
            
            return sharedService;
});
    
