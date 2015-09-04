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
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
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
            console.info('onSuccessItem', fileItem, response, status, headers);
            $scope.imgAddress = response.filePath;
            sharedService.prepForBroadcast('imgUpload', $scope.imgAddress);            
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
		$scope.orightml = '<h2>Try me!</h2><p><lnk id="1" start="keio university" end="#">This is a testing link.</lnk></p><p><loc type = \' university.1.~$!@#^&%*()-= \' id = "中文" lat="35.554498 " lng="139.6485728" name ="keio university">textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</loc></p><p><loc lat="35.55129247928427" lng="139.671764373779" name="#"><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></loc></p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn\'t Use an iFrame</li><li>Works with Firefox, Chrome, and IE8+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p>';
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
    
            sharedService.prepForBroadcast = function(msgID, msgValue){
                switch(msgID)
                {
                    case 'imgUpload':
                        this.imgAddress = msgValue;
                        console.info('imgUploadMsg:', msgValue);
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
                        var loc = {tag:'', content:'', id:'', lat:0, lng:0, name:'', type:''};
                        locstr = res[i];
                        loc.tag = locstr.match(/<\s*loc.*?>/g) + '</loc>';
                        loc.content = locstr.replace(/<\s*loc.*?>/g,'').replace(/<\s*\/\s*loc\s*.*?>/g,'');

                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);

                        match = myRegex.exec(loc.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=");
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

                        locs.push(loc);
                    }
                }
                
                return locs;
            }
            
            sharedService.getLnks = function(htmlstr){
                res = htmlstr.match(/<\s*lnk.*?>(.*?)<\s*\/\s*lnk\s*.*?>/g);
                
                var lnks = new Array();
                if(res)
                {
                    for(i=0; i<res.length; i++)
                    {
                        var lnk = {tag:'', content:'', id:'', start:'', end:''};
                        lnkstr = res[i];
                        lnk.tag = lnkstr.match(/<\s*lnk.*?>/g) + '</lnk>';
                        lnk.content = lnkstr.replace(/<\s*lnk.*?>/g,'').replace(/<\s*\/\s*lnk\s*.*?>/g,'');
                        
                        myRegex = new RegExp(/^<(\w+)((?:\s+\w+((?:\s*)=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/);
                        match = myRegex.exec(lnk.tag);
                        attrs = match[2].replace(/'/g, "\"").replace(/\s*"\s*/g,"\"").replace(/\s*=\s*/g,"=");
                        id = attrs.match(/id="([^"]*)"/);
                        start = attrs.match(/start="([^"]*)"/);
                        end = attrs.match(/end="([^"]*)"/);
                        
                        if(id)lnk.id = id[1];
                        if(start)lnk.start = start[1];
                        if(end)lnk.end = end[1];
                        
                        lnks.push(lnk);
                        console.info('lnks:', lnks);
                    }
                }
                
                return lnks;
            }
    
            sharedService.parseHtml = function(htmlinput){
                var jscontents = {locs:'', lnks:''};
                jscontents.locs = this.getLocs(htmlinput);
                jscontents.lnks = this.getLnks(htmlinput);
                return jscontents;
            };
            
            return sharedService;
});
    
