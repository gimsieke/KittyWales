var bg = chrome.extension.getBackgroundPage();

document.addEventListener(
  "DOMContentLoaded",
  function(evt) {
    render_settings();
  },
  false
);

var patch_option_html = function(doc, settings) {
  doc.getElementById('tags2').innerHTML = settings.searchterms;
  doc.getElementById('tags').value = settings.searchterms;
  var searchmode = settings.searchmode || 'all';
  doc.getElementById(searchmode).checked = true;
  if (settings.imgUrl !== undefined && settings.imgUrl !== '') {
    doc.getElementById('icon').src = settings.imgUrl;
  }
  doc.getElementById('count').innerHTML = settings.count;
};

var render_settings = function(action) {
  if (action == undefined) {
		action = 'getopt';
	}
  chrome.extension.sendRequest(
    {"action": action},
    function(response) {
      patch_option_html(document, response);
    }
  );
};

var save_options = function() {
  localStorage['opt_searchterms'] = normalize_searchterms(document.getElementById('tags').value);
  localStorage['opt_logic_op'] = document.getElementById('any').checked ? 'any' : 'all';
  document.getElementById('save').innerHTML = 'Saving\u2026';
  var timer = setTimeout (
    function() {
      document.getElementById('save').innerHTML = 'Save';
    },
    700
  );
  render_settings('setopt');
}

var normalize_searchterms = function(string) {
  return string.replace(/\s+/, ',').replace(/[^\w,]/g, '').replace(/^,+/, '').replace(/,+$/, '');
}
