var FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';

function doGet(e) {
  if (!e.parameter.url) {
    return HtmlService.createHtmlOutput('<p>Contract Drafter connector is active.</p>');
  }
  try {
    var fileUrl = e.parameter.url;
    var filename = e.parameter.filename || 'document.docx';
    var docTitle = filename.replace(/\.docx$/i, '');
    var response = UrlFetchApp.fetch(fileUrl);
    var blob = response.getBlob().setName(filename);
    var resource = {
      name: docTitle,
      parents: [FOLDER_ID],
      mimeType: 'application/vnd.google-apps.document'
    };
    var file = Drive.Files.create(resource, blob);
    var docUrl = 'https://docs.google.com/document/d/' + file.id + '/edit';
    return HtmlService.createHtmlOutput('<html><head><meta http-equiv="refresh" content="0;url=' + docUrl + '"></head><body><p>Google Doc created! <a href="' + docUrl + '">Click here</a> if not redirected.</p></body></html>');
  } catch (err) {
    return HtmlService.createHtmlOutput('<html><body><h3>Error</h3><p>' + err.message + '</p></body></html>');
  }
}
