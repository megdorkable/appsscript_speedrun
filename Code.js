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
    // this will store the most recent best time date for the game overall across all categories, used for sorting
    this.game_date = undefined;
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

  // sort function to sort speedruns by the fastest time
  static fastest(a, b) {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  }

  // sort function to sort speedruns by the newest date
  static newest(a, b) {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  }

  // sort function to sort speedruns
  // this utilizes the game_date variable to group speedruns by game, placing the game with the most recent best time date ..
  // .. first, then within each group sort by the newest date
  static game_sort(a, b) {
    if (a.game == b.game) {
      return Speedrun.newest(a, b);
    } else {
      if (a.game_date > b.game_date) {
        return -1;
      }
      if (a.game_date < b.game_date) {
        return 1;
      }
      return 0;
    }
  }
}

// main function - finds and outputs best times
function get_best_times() {
  let best_times = [];
  let game_values = games_range.getValues();

  let speedruns = get_speedruns(game_values);
  let games_cats = get_games_cats(game_values);

  // find the best time for each [game, category] pair and store in best_times
  games_cats.forEach(function myFunction(game_cat, index, arr) {
    let result = speedruns.filter(function myFunction(speedrun) {
      return speedrun.game === game_cat[0] && speedrun.category === game_cat[1] && speedrun.version === game_cat[2] &&
             speedrun.variables === game_cat[3] && speedrun.platform === game_cat[4];
    });

    result.sort(Speedrun.fastest);
    best_times.push(result[0]);
  });

  // find the most recent best time for each game across all categories, and set each item's game_date variable to that date
  // then sort the best times into groups based on the game_date variable
  let newest = [...best_times].sort(Speedrun.newest);
  best_times.forEach(function myFunction(item, index, arr) {
    let i = newest.findIndex(function myFunction(speedrun) {
      return speedrun.game == item.game
    });
    item.game_date = newest[i].date
  });
  best_times.sort(Speedrun.game_sort)

  // convert each speedrun object to an array/row to get ready to output
  best_times.forEach(function myFunction(item, index, arr) {
    arr[index] = item.toRow();
  });

  // Logger.log(JSON.stringify(best_times));

  // set up output range
  let row_start = output_range.getRow();
  let row_depth = best_times.length;
  let col = output_range.getColumn();
  let column_depth = HEADER.length;

  // output
  let output_range_full = output_sheet.getRange(row_start, col, row_depth, column_depth);
  unmerge_all(output_range_full);
  output_range_full.setValues(best_times);
  merge_game_groups(output_range_full);
}

// get all rows as Speedrun objects
function get_speedruns(game_values) {
  let speedruns = [];

  // create objects
  game_values.forEach(function myFunction(row, index, arr) {
    if (row[0] != "") {
      speedruns.push(new Speedrun(
        row[HEADER.indexOf("Game")], row[HEADER.indexOf("Category")], row[HEADER.indexOf("Version")], row[HEADER.indexOf("Variables")],
        row[HEADER.indexOf("Platform")], row[HEADER.indexOf("Time")], row[HEADER.indexOf("Date (Y-M-D)")], 
        row[HEADER.indexOf("Video")], row[HEADER.indexOf("Comments")], row[HEADER.indexOf("Notes")]
      ));
    }
  })

  return speedruns;
}

// get unique sets of columns
function uniqueColumns(vals, col1, col2, col3, col4, col5){
  let singleArray = vals.map(row => [row[col1], row[col2], row[col3], row[col4], row[col5]]);
  let unique = [...new Set(singleArray.map(JSON.stringify))].map(JSON.parse);
  let uniqueSorted = unique.filter(n => n).sort();
  uniqueSorted = uniqueSorted.filter(function(n) { 
    return n[0].trim() != "";
  });

  return uniqueSorted;
}

// get unique sets of Game,Category,Version,Variables,Platform
function get_games_cats(game_values) {
  return uniqueColumns(
    game_values, HEADER.indexOf("Game"), HEADER.indexOf("Category"), 
    HEADER.indexOf("Version"), HEADER.indexOf("Variables"), HEADER.indexOf("Platform")
  );
}

// find all merged ranges and unmerge them
function unmerge_all(range) {
  range.getMergedRanges().forEach(function myFunction(r, index, arr) {
    r.breakApart();
  });
}

// merge all game groups vertically
function merge_game_groups(range) {
  let game_values = range.getValues();
  let i = HEADER.indexOf("Game");
  let singleArray = game_values.map(row => row[i]);

  let cur_game = undefined;
  let cur_count = 1;
  singleArray.forEach(function myFunction(game, index, arr) {
    if (cur_game == undefined) {
      cur_game = game;
    } else if (game == cur_game) {
      cur_count += 1;
    } else {
      // set up merge range
      let row_start = range.getRow() + index - cur_count;
      let row_depth = cur_count;
      let col = i + 1;

      // merge
      output_sheet.getRange(row_start, col, row_depth).mergeVertically();

      // set values to next game
      cur_game = game;
      cur_count = 1;
    }
  });
}

function onEdit(e) {
  // run on edit
}