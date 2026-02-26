// Google Apps Script: receives a .docx URL, converts to Google Doc, saves to folder
// Deploy as: Web App → Execute as "Me" → Access "Anyone"

var FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
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

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: docUrl,
      id: file.id
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
