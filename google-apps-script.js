var FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';

function doGet(e) {
  // If no parameters, show status page
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

    // Upload to Drive and convert to Google Docs format
    var resource = {
      title: docTitle,
      parents: [{ id: FOLDER_ID }]
    };
    var file = Drive.Files.insert(resource, blob, { convert: true });

    var docUrl = 'https://docs.google.com/document/d/' + file.id + '/edit';

    return HtmlService.createHtmlOutput(
      '<html><head><meta http-equiv="refresh" content="0;url=' + docUrl + '"></head>'
      + '<body><p>Google Doc created! Redirecting... <a href="' + docUrl + '">Click here</a> if not redirected.</p></body></html>'
    );
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<html><body><h3>Error creating document</h3><p>' + err.message + '</p>'
      + '<p><a href="https://drive.google.com/drive/folders/' + FOLDER_ID + '">Open Drive folder</a></p></body></html>'
    );
  }
}
