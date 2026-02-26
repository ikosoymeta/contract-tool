// Google Apps Script: receives a .docx URL, converts to Google Doc, saves to folder
// Deploy as: Web App → Execute as "Me" → Access "Anyone" (or "Anyone within Meta")

var FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';

function doPost(e) {
  try {
    // Accept both JSON body and form POST (payload field)
    var data;
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      data = JSON.parse(e.postData.contents);
    }

    var fileUrl = data.url;
    var filename = data.filename || 'document.docx';
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

    // Return an HTML page that redirects to the created Google Doc
    var html = '<html><head>'
      + '<meta http-equiv="refresh" content="0;url=' + docUrl + '">'
      + '</head><body>'
      + '<p>Google Doc created! <a href="' + docUrl + '">Open document</a></p>'
      + '</body></html>';
    return HtmlService.createHtmlOutput(html);

  } catch (err) {
    var errorHtml = '<html><body>'
      + '<h3>Error creating document</h3>'
      + '<p>' + err.message + '</p>'
      + '<p><a href="https://drive.google.com/drive/folders/' + FOLDER_ID + '">Open Drive folder</a></p>'
      + '</body></html>';
    return HtmlService.createHtmlOutput(errorHtml);
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<html><body><p>Contract Drafter - Google Drive connector is active.</p></body></html>'
  );
}
