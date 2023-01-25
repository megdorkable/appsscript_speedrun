function myFunction() {
  // CUSTOM VALUES
  const DATA_SHEET_NAME = "Master Sheet";
  const DATA_RANGE = "A2:J";
  const OUTPUT_SHEET_NAME = "Sheet3";

  // GLOBAL OBJECTS
  const SS = SpreadsheetApp.getActiveSpreadsheet();
  const DATA_SHEET = SS.getSheetByName(DATA_SHEET_NAME);
  const GAMES_RANGE = DATA_SHEET.getRange(DATA_SHEET_NAME + "!" + DATA_RANGE);
  const OUTPUT_SHEET = SS.getSheetByName(OUTPUT_SHEET_NAME);
  const OUTPUT_RANGE_START = "A2";

  var game_values = GAMES_RANGE.getValues();
  
  var unique = uniqueColumn(game_values, 0);

  //Set up the sheet data ranges to paste the unique array into the Sheet
  const output_range = OUTPUT_SHEET.getRange(OUTPUT_RANGE_START);
  const rowStart = output_range.getRow();
  const rowDepth =  unique.length;
  const col = output_range.getColumn();
  
  //Paste the array into the sheet
  OUTPUT_SHEET.getRange(rowStart, col, rowDepth).setValues(unique);

  Logger.log(JSON.stringify(unique));
}

function uniqueColumn(vals, col){
  let singleArray = vals.map(row => row[col]);
  let unique = [...new Set(singleArray)];
  let uniqueSorted = unique.filter(n => n).sort();

  // return uniqueSorted

  return uniqueSorted.map(row=> [row]);
};

function onEdit(e) {
  // Set a comment on the edited cell to indicate when it was changed.
  // var range = e.range;
  // range.setNote('Last modified: ' + new Date());
}