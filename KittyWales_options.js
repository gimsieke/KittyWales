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
  var logic_op = settings.logic_op || 'all';
  doc.getElementById(logic_op).checked = true;
  if (settings.previewUrl !== undefined && settings.previewUrl !== '') {
    doc.getElementById('icon').src = settings.previewUrl;
  }
  doc.getElementById('count').innerHTML = settings.count;
};

var render_settings = function(reset) {
  action = (reset !== undefined && reset) ? 'reset' : 'getopt';
  chrome.extension.sendRequest(
    {"action": action},
    function(response) {
      patch_option_html(document, response);
    }
  );
};

var save_options = function() {
  localStorage['opt_searchterms'] = normalize_searchterms(document.getElementById('tags').value);
  // No wonder the web people don't like XPath if its implementation isn't able to select something 
  // depending on its @checked attribute. The following doesn't seem to work:
  //  localStorage['opt_logic_op'] = document.evaluate("//input[@type = 'radio'][@name = 'logic_op'][@checked]/@id", document, null, XPathResult.STRING_TYPE, null).stringValue;
  localStorage['opt_logic_op'] = document.getElementById('any').checked ? 'any' : 'all';
  document.getElementById('save').innerHTML = 'Saving\u2026';
  var timer = setTimeout (
    function() {
      document.getElementById('save').innerHTML = 'Save';
    },
    700
  );
  render_settings();
}

var normalize_searchterms = function(string) {
  return string.replace(/\s+/, ',').replace(/[^\w,]/g, '').replace(/^,+/, '').replace(/,+$/, '');
}
