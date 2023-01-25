// DATA
// data input
const DATA_SHEET_NAME = "All Completed Runs";
const DATA_RANGE = "A2:J";
const HEADER = ["Game", "Category", "Version", "Variables", "Platform", "Time", "Date (Y-M-D)", "Video", "Comments", "Notes"];
// data output
const OUTPUT_SHEET_NAME = "Personal Best Times";
const OUTPUT_RANGE_START = "A2";

// variables
const ss = SpreadsheetApp.getActiveSpreadsheet();
const data_sheet = ss.getSheetByName(DATA_SHEET_NAME);
const output_sheet = ss.getSheetByName(OUTPUT_SHEET_NAME);
const games_range = data_sheet.getRange(DATA_RANGE);
const output_range = output_sheet.getRange(OUTPUT_RANGE_START);

class Speedrun {
  constructor(game, category, version, variables, platform, time, date, video, comments, notes) {
    this.game = game;
    this.category = category;
    this.version = version;
    this.variables = variables;
    this.platform = platform;
    this.time = time;
    this.date = date;
    this.video = video;
    this.comments = comments;
    this.notes = notes;
  }

  toRow() {
    let row = Array(HEADER.length);
    row[HEADER.indexOf("Game")] = this.game;
    row[HEADER.indexOf("Category")] = this.category;
    row[HEADER.indexOf("Version")] = this.version;
    row[HEADER.indexOf("Variables")] = this.variables;
    row[HEADER.indexOf("Platform")] = this.platform;
    row[HEADER.indexOf("Time")] = this.time;
    row[HEADER.indexOf("Date (Y-M-D)")] = this.date;
    row[HEADER.indexOf("Video")] = this.video;
    row[HEADER.indexOf("Comments")] = this.comments;
    row[HEADER.indexOf("Notes")] = this.notes;
    return row;
  }

  static fastest(a, b) {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  }

  static newest(a, b) {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  }
}

function get_best_times() {
  let best_times = [];
  // get values
  let game_values = games_range.getValues();

  let speedruns = get_speedruns(game_values);
  // let games = get_games(game_values);
  let games_cats = get_games_cats(game_values);

  games_cats.forEach(function myFunction(game_cat, index, arr) {
    let result = speedruns.filter(function myFunction(speedrun) {
      return speedrun.game === game_cat[0] && speedrun.category === game_cat[1];
    });
    result.sort(Speedrun.fastest);
    best_times.push(result[0]);
  });

  // best_times.sort(Speedrun.newest);
  best_times.forEach(function myFunction(item, index, arr) {
    arr[index] = item.toRow();
  });

  Logger.log(JSON.stringify(best_times));

  // set up output
  let row_start = output_range.getRow();
  let row_depth = best_times.length;
  let col = output_range.getColumn();
  let column_depth = HEADER.length;

  // output
  output_sheet.getRange(row_start, col, row_depth, column_depth).setValues(best_times);
}

function get_speedruns(game_values) {
  let speedruns = [];

  // create objects
  game_values.forEach(function myFunction(row, index, arr) {
    // Logger.log(JSON.stringify(row));
    if (row[0] != "") {
      speedruns.push(new Speedrun(
        row[HEADER.indexOf("Game")], row[HEADER.indexOf("Category")], row[HEADER.indexOf("Version")], row[HEADER.indexOf("Variables")],
        row[HEADER.indexOf("Platform")], row[HEADER.indexOf("Time")], row[HEADER.indexOf("Date (Y-M-D)")], 
        row[HEADER.indexOf("Video")], row[HEADER.indexOf("Comments")], row[HEADER.indexOf("Notes")]
      ));
    }
  })

  // Logger.log(JSON.stringify(speedruns));

  return speedruns;
}

function uniqueColumn(vals, col){
  let singleArray = vals.map(row => row[col]);
  let unique = [...new Set(singleArray)];
  let uniqueSorted = unique.filter(n => n).sort();

  return uniqueSorted.map(row=> [row]);
}

function get_games(game_values) {
  return uniqueColumn(game_values, HEADER.indexOf("Game"));
}

function uniqueColumns(vals, col1, col2){
  let singleArray = vals.map(row => [row[col1], row[col2]]);
  let unique = [...new Set(singleArray.map(JSON.stringify))].map(JSON.parse);
  let uniqueSorted = unique.filter(n => n).sort();
  uniqueSorted = uniqueSorted.filter(function(n) { 
    return n[0].trim() != "";
  });

  return uniqueSorted;
}

function get_games_cats(game_values) {
  return uniqueColumns(game_values, HEADER.indexOf("Game"), HEADER.indexOf("Category"));
}

function onEdit(e) {
  // Set a comment on the edited cell to indicate when it was changed.
  // var range = e.range;
  // range.setNote('Last modified: ' + new Date());
}