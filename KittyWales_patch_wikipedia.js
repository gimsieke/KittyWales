var flickrPatchJimbo  = function(url) {
  chrome.extension.sendRequest(
    {action: "getopt"},
    function(response) {
      var req = new XMLHttpRequest();
      var cnt = Number(response.count);
      cnt = cnt > 8000 ? 8000 : cnt; // 8000 because the max. admissible page number in the query is limited
      var rnd = Math.ceil(Math.random() * cnt * 0.3); //  0.3 for sorting out less relevant photos
      rnd = rnd == 0 ? cnt : rnd; // in order not to get page=0 for cnt <= 3 or random == 0.0
      if (rnd > 0) {
        var url = response.url + '&page=' + rnd;
        req.open('GET', url);
        req.onreadystatechange = function() {
          if (req.readyState === 4 && req.status === 200) {
            var res = JSON.parse(req.responseText);
            if (res.photos.photo !== undefined) {
              var elt = document.getElementById('centralNotice').getElementsByTagName('div')[0];
              var photo = res.photos.photo[0];
              var imgUrl = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
              image = new Image();
              image.onload = function() {
                elt.style.height = this.naturalHeight + 'px';
                elt.style.backgroundImage = 'url(' + imgUrl + ')';
              }
              image.src = imgUrl;
            } 
          }
        };
        req.send();
      }
    }
  );
};


var repeat = setInterval(
  function() {
    var elt = document.getElementById('centralNotice').getElementsByTagName('div')[0];
    if (elt !== undefined) {
      if (! elt.style.backgroundImage.match(/flickr/)) {
        flickrPatchJimbo();
        clearInterval(repeat);
      }
    }
  },
  400
);

