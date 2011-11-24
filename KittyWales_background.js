var bg = chrome.extension.getBackgroundPage();

bg.prefetchedRenderData = undefined;
bg.previousFlickrResult = undefined;

var init = function(action) {
  var unconditional;
  if (action == undefined) {
    action = function(result) {
      bg.previousFlickrResult = result;
      // Passing this to withFlickrResult below will ensure randomness of the first image.
      // 1st invocation: get number of photos, 2nd invocation: get random photo
      withFlickrResult(update);
    };
  } else {
    unconditional = true;
  }
  reset_opts(unconditional);
  withFlickrResult(action);
};

var reset_opts = function(unconditional) {
  if (localStorage['opt_searchterms'] == undefined || (unconditional !== undefined && unconditional)) {
    localStorage['opt_searchterms'] = 'lolcat';
  }
  if (localStorage['opt_logic_op'] == undefined || (unconditional !== undefined && unconditional)) {
    localStorage['opt_logic_op'] = 'all';
  }
};

var update = function(flickrResult) {
  bg.previousFlickrResult = flickrResult;
  flickrToRenderable(flickrResult, storeRenderable);
};

var storeRenderable = function(renderable) {
  bg.prefetchedRenderData = renderable;
}

var withFlickrResult = function(callback) {
  var req = new XMLHttpRequest();
  var cnt = bg.previousFlickrResult == undefined || bg.previousFlickrResult.photos == undefined ? 1 : bg.previousFlickrResult.photos.total;
  cnt = cnt > 6000 ? 6000 : cnt; // 6000 because the max. admissible page number in the query is limited
  var rnd = Math.ceil(Math.random() * cnt * 0.3); //  0.3 for sorting out less relevant photos
  if (rnd > 0) {
    var url = flickrUrl() + '&page=' + rnd;
    req.open('GET', url);
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        var res = JSON.parse(req.responseText);
        var photo = res.photos.photo[0];
        if (photo !== undefined) {
          callback(res);
        } else callback({});
      }
    };
    req.send();
  }
    
};

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

var flickrToRenderable = function(flickrResult, callback) {
  if (flickrResult.photos !== undefined) {
    var photo = flickrResult.photos.photo[0];
    if (photo !== undefined) {
      var imgUrl = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
      image = new Image();
      image.onload = function() {
        var height = this.naturalHeight + 'px';
        callback( { count: flickrResult.photos.total,
                    imgUrl: imgUrl,
                    height: height,
                    searchterms: localStorage['opt_searchterms'],
                    searchmode: localStorage['opt_logic_op']
                  });
      }
      image.src = imgUrl;
    }
  } else {
    callback( { count: 0,
                imgUrl: 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Wikipedia-lolcat.jpg/220px-Wikipedia-lolcat.jpg',
                height: 176,
                searchterms: localStorage['opt_searchterms'],
                searchmode: localStorage['opt_logic_op']
              })
  }
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "reset") {
      reset_opts(true);
      init(function(result) {
             bg.previousFlickrResult = result;
             withFlickrResult(function(result2) {
                                update(result2);
                                flickrToRenderable(result2, sendResponse);
                              });
           });
    } else if (request.action == "getopt") {
      var savedData = bg.prefetchedRenderData;
      withFlickrResult(update);
      sendResponse(savedData);
    } else if (request.action == "setopt") {
      withFlickrResult(function(result) {
                         update(result);
                         flickrToRenderable(result, sendResponse);
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
