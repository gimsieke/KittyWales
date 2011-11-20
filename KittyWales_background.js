
var photoCount = 0;

var init = function(unconditional) {
  if (localStorage['opt_searchterms'] == undefined || (unconditional !== undefined && unconditional)) {
    localStorage['opt_searchterms'] = 'lolcat';
  }
  if (localStorage['opt_logic_op'] == undefined || (unconditional !== undefined && unconditional)) {
    localStorage['opt_logic_op'] = 'all';
  }
}

var flickrUrl = function() {
  return 'http://api.flickr.com/services/rest/'
          + '?format=json&nojsoncallback=1'
          + '&sort=relevance'
          + '&per_page=1'
          + '&method=flickr.photos.search'
          + '&tags=' + encodeURIComponent(localStorage['opt_searchterms']) 
          + '&tag_mode=' + encodeURIComponent(localStorage['opt_logic_op']) 
          + '&api_key=8810bb1a272496e1973c19a8861dc084';
};

var updateCounts = function(fn) {
  var req = new XMLHttpRequest();
  req.open('GET', flickrUrl());
  req.onreadystatechange = function() {
    if (req.readyState === 4 && req.status === 200) {
      var res = JSON.parse(req.responseText);
      if (res.photos.photo !== undefined) {
				photoCount = Number(res.photos.total);
        return fn(res);
      }
    }
  };
  req.send();
};
  
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
		if (request.action == "reset") {
			init();
    }
    if (request.action == "getopt" || request.action == "reset") {
      updateCounts(function(flickrResponse) { 
        var photo = flickrResponse.photos.photo[0];
        sendResponse({ searchterms: localStorage['opt_searchterms'],
                       logic_op: localStorage['opt_logic_op'],
  										 url: flickrUrl(),
											 count: flickrResponse.photos.total,
  										 previewUrl: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg'
                     });
			});
    } 
  }
);                                    

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if ( changeInfo.status == 'complete' && tab.url.match(/https?:\/\/(\w+\.)?wikipedia\.org/) ) {
      chrome.pageAction.show(tabId);
    }
  }
);
