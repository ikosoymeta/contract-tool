var FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';

function doGet(e) {
  if (!e.parameter.url) {
    return HtmlService.createHtmlOutput('<p>Contract Drafter connector is active.</p>');
  }
  try {
    var fileUrl = e.parameter.url;
    var filename = e.parameter.filename || 'document.docx';
    var docTitle = filename.replace(/\.docx$/i, '');

    // Fetch the .docx file from the Cloudflare Worker
    var response = UrlFetchApp.fetch(fileUrl);
    var blob = response.getBlob().setName(filename);

    // Save .docx to Drive folder
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var tempFile = folder.createFile(blob);

    // Convert to Google Doc using Drive API v2
    var fileId = tempFile.getId();
    var url = 'https://www.googleapis.com/drive/v2/files/' + fileId + '/copy';
    var payload = {
      title: docTitle,
      parents: [{id: FOLDER_ID}],
      mimeType: 'application/vnd.google-apps.document'
    };
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    var copyResponse = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(copyResponse.getContentText());

    // Delete the original .docx
    tempFile.setTrashed(true);

    if (result.id) {
      var docUrl = 'https://docs.google.com/document/d/' + result.id + '/edit';
      return HtmlService.createHtmlOutput('<html><head><meta http-equiv="refresh" content="0;url=' + docUrl + '"></head><body><p>Google Doc created! <a href="' + docUrl + '">Click here</a> if not redirected.</p></body></html>');
    } else {
      throw new Error(result.error ? result.error.message : 'Unknown error');
    }
  } catch (err) {
    return HtmlService.createHtmlOutput('<html><body><h3>Error</h3><p>' + err.message + '</p></body></html>');
  }
}
