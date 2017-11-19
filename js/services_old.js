angular.module('starter.services', [])

.factory('mySharedService', function($rootScope, $http, $q) {
  // Might use a resource here that returns a JSON array
    
    var sharedService = {};
    sharedService.imgAddress = '';
    //sharedService.htmlcontent = '<loc src="https://realtime.opensensors.io/v1/events/topics//orgs/wd/aqe/heartbeat?api-key=e40cc884-d147-4585-aa3c-ca1b9249171b" lat="35.554498" lng="139.6485728" type="realtime"></loc>';
    //sharedService.htmlcontent = '<loc src="http://131.113.137.99:5000/main" lat="35.554498 " lng="139.6485728" type="realtime"></loc>\n<loc src="http://131.113.136.55:5000/node1" x="90" y="47" name="sensor1" type="realtime"></loc>';
    //sharedService.htmlcontent = '<loc lat="35.554498" lng="139.6485728" x="150" y="150" style="r:10;fill:black;stroke:red;width:1px;"></loc><loc lat="35.56" lng="139.632" style="fill:yellow;stroke:green;"></loc>';
    sharedService.htmlcontent = '<loc id="mobileMic" src="http://localhost" x="15" y="30"></loc>\n<loc id="drone" type="actuator" src="http://localhost" x="15" y="40"></loc>\n<lnk function="LINEAR(drone.upspeed, mobileMic.data.pow, 1/100000);"></lnk>';
    //loc[id='mobileMic'].data.pow = 0;
    sharedService.jsoncontent = '';
    sharedService.locAddress = '';
    sharedService.lnkAddress = '';
    sharedService.searchResult = null;
    sharedService.insertLoc = null;
    sharedService.mapUpdateType = 'all';
    
    sharedService.getLocbyId = function(locId, targetLocs){
        if(targetLocs.length != 0)
        {
            for(var i=0; i<targetLocs.length; i++)
            {
                if(targetLocs[i].id == locId)
                    return targetLocs[i];
            }
            console.log("Id "+ locId +" No matched <loc>.");
            return false; 
                
        }
        else
        {
            console.log("Loc array does not exist.");
            return false;
        }
    }
    
    sharedService.parseHtml = function(){
        var jscontents = {locs:'', lnks:''};
        jscontents.locs = new Array();
        jscontents.lnks = new Array();
        
        locres = this.htmlcontent.match(/<\s*loc.*?>(.*?)<\s*\/\s*loc\s*.*?>/g);
        lnkres = this.htmlcontent.match(/<\s*lnk.*?>(.*?)<\s*\/\s*lnk\s*.*?>/g);  
        
        if(locres)
        {
            for(i=0; i<locres.length; i++)
            {
                var loc = {tag:'', content:'', src:'', id:'', lat:99999, lng:99999, x:99999, y:99999, name:'', type:'', style:'', data:''};
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
                x = attrs.match(/x="([0-9/.]*)"/);
                y = attrs.match(/y="([0-9/.]*)"/);
                
                if(lat && lng)
                {
                    loc.lat = lat[1];
                    loc.lng = lng[1];
                }
                if(x && y)
                {
                    if(x[1] > 0 && x[1] < 100 && y[1] > 0 && y[1] < 100)
                    {
                        loc.x = x[1];
                        loc.y = y[1];
                    }
                    else
                        alert('Please set x and y between 0 and 100. 0 and 100 not included.');
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
                   
                if(src)
                {
                    loc.src = src[1];
                    
                    if(loc.lat == 99999 && loc.lng == 99999 && loc.x == 99999 && loc.y == 99999)
                    {
                    
                        loc.lat = "35.554498";
                        loc.lng = "139.6485728";
                        alert('To show the data from ' + loc.src +', you need to bind the lat and lng to a pair of fixed coordinates or corresponding keys in dataset. Initial location has been set to (35.554498, 139.6485728).');
                    }
                        
                }                           
                
                jscontents.locs.push(loc);
            }    
        }
        
        if(lnkres)//if any <lnk> tag existed in html input.
        {
            for(i=0; i<lnkres.length; i++)
            {
                var lnk = {tag:'', content:'', src:'', id:'', points:'', category:'', fn:'', fn_name:'', fn_parameter:'', style:''};
                lnk.points = [];
                lnk.fn = [];
                lnk.fn_parameter = [];
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
            
                id = attrs.match(/id="([^"]*)"/);
                fn = attrs.match(/function="([^"]*)"/);
                category = attrs.match(/category="([^"]*)"/);
                temps = attrs.match(/points="([^"]*)"/);
                if(temps)
                    lnk.points = temps[1].split(/[,]+/);
                             
                if(id)lnk.id = id[1];
                if(fn)
                {
                    lnk.fn_name = fn[1].match(/([a-zA-Z]+)[\(]/)[1];
                    lnk.fn_parameter = fn[1]
                        .replace(/.*[\(]/g,'')  //delete (
                        .replace(/[\)]/g,'')    //delete )
                        .replace(/[;]*/g,'')    //delete all ;
                        .match(/[^,]+/g);       //match all strings that seperated by ,
                    console.log(lnk.fn_name, lnk.fn_parameter);
                    for(var i = 0; i < lnk.fn_parameter.length; i++)
                    {
                        var elem = {prefix:'', suffix:''};
                        var temp = lnk.fn_parameter[i].match(/([a-zA-Z]\w+)[\.]/g);
                        if(temp)
                        {
                            prefix = temp[0].replace(".", "");
                            suffix = lnk.fn_parameter[i].replace(temp[0], "");
                            //console.info("Prefix"+i+": ", prefix, suffix);
                            if(sharedService.getLocbyId(prefix, jscontents.locs))
                            {
                                elem.prefix = prefix;
                                elem.suffix = suffix;
                            }       
                            
                        }
                        else
                        {
                            if(sharedService.getLocbyId(lnk.fn_parameter[i], jscontents.locs))
                                {
                                    elem.prefix = lnk.fn_parameter[i];
                                }
                        }
                        if(elem.prefix)lnk.fn.push(elem);
                    }
                    //console.info("lnk.fn[]: ", lnk.fn);
                }
                //else if(points)
                if(category)lnk.category = category[1];
                jscontents.lnks.push(lnk);
                        
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
        
        return jscontents;
    }
    
    if(sharedService.htmlcontent)
        sharedService.jsoncontent = sharedService.parseHtml();
    
  

  return {
    remove: function() {
      return null;
    },
    get: function() {
      //console.info("sharedService:", sharedService.jsoncontent.locs[0].data.content);
      return sharedService;
    },
    getLocbyId: function(locId){
        return sharedService.getLocbyId(locId, sharedService.jsoncontent.locs);
    }
  };
});
