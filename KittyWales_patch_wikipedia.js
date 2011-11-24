var flickrPatchJimbo  = function() {
  chrome.extension.sendRequest(
    {action: "getopt"},
    function(response) {
      var elt = document.getElementById('centralNotice').getElementsByTagName('div')[0];
      if (elt !== undefined) {
        elt.style.height = response.height;
        elt.style.backgroundImage = 'url(' + response.imgUrl + ')';
      }
    }
  );
};


var repeat = setInterval(
  function() {
		var parent = document.getElementById('centralNotice');
		if (parent !== undefined) {
			var elt = parent.getElementsByTagName('div')[0];
			if (elt !== undefined) {
				if (elt.style.backgroundImage !== undefined && ! elt.style.backgroundImage.match(/flickr/)) {
					flickrPatchJimbo();
					clearInterval(repeat);
				}
			}
		}
  },
  400
);

