const fs = require('fs');
const moment = require('moment');

// Set the range of the dates
const startDate = moment("16-06-2023", "DD-MM-YYYY");
const endDate = moment("23-06-2023", "DD-MM-YYYY");

// Set the hours
const hours = ["06", "12", "18", "24"];

const combinations = ['heavy_vercel_ap-southeast-1', 'heavy_vercel_us-east-1', 'heavy_vercel_eu-west-1', 'heavy_pages_ap-southeast-1', 'heavy_pages_us-east-1', 'heavy_pages_eu-west-1', 'simple_vercel_ap-southeast-1', 'simple_vercel_us-east-1', 'simple_vercel_eu-west-1', 'simple_pages_ap-southeast-1', 'simple_pages_us-east-1', 'simple_pages_eu-west-1']

// Get the file name from the environment variable
const fileName = process.env.FILE_NAME;

if (!fileName) {
  console.error('File name not provided!');
  process.exit(1);
}

// Read the specified file
const fileContent = fs.readFileSync(`output/${fileName}`, 'utf-8',)

const data = fileContent.split('\n');
const headers = data[0].split(';');

const rows = data.slice(1);
// Parsing rows to get data in a structured format
let parsedRows = rows.map(row => {
  const values = row.split(';');
  const rowObject = {};
  headers.forEach((header, index) => {
    rowObject[header] = values[index];
  });
  return rowObject;
});

// Filtering parsedRows to handle undefined or NaN values and removing duplicates
parsedRows = parsedRows
  .filter((row) => row.VALUE && !isNaN(row.VALUE))
  .filter((row, index, self) => {
    const rowKey = `${row.SERIES}_${row.TIME}`;
    return index === self.findIndex(r => `${r.SERIES}_${r.TIME}` === rowKey);
  });
let completeData = [...parsedRows];
const uniqueSeriesTimes = new Set(completeData.map((row) => `${row.SERIES}_${row.TIME}`));



let skippedRows = 0;

const multiplier = 0.9; // replace with the multiplier to decrease the values each day

// Find minimum and maximum values for each series
const seriesValues = {};
for (const series of combinations) {
  const seriesRows = parsedRows.filter(row => row.SERIES === series);
  const seriesValuesArr = seriesRows.map(row => parseFloat(row.VALUE)).filter(val => !isNaN(val));
  if (seriesValuesArr.length === 0) {
    throw Error(`No values found for series ${series}`);
  }
  seriesValues[series] = {
    minVal: Math.min(...seriesValuesArr),
    maxVal: Math.max(...seriesValuesArr),
    avgVal: seriesValuesArr.reduce((acc, val) => acc + val, 0) / seriesValuesArr.length
  };
}

let valRanges = {};
let addedVals = {};
for (const series of combinations) {
  valRanges[series] = seriesValues[series].maxVal - seriesValues[series].minVal;
  addedVals[series] = seriesValues[series].maxVal * 1.2;
}


// For each day in the date range
for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
  // For each series
  for (const series of combinations) {
    // For each hour
    for (const hour of hours) {
      const time = `${date.format('DD-MM-YYYY')}T${hour}:00`;
      const seriesTime = `${series}_${time}`;

      const values = parsedRows.filter((row) => row.SERIES === series).map(row => parseFloat(row.VALUE));

      if(values.length === 0) {
        throw Error(`No values found for series ${series}`);
      }


      if (!uniqueSeriesTimes.has(seriesTime)) {
        const minVal = seriesValues[series].minVal;
        const avgVal = seriesValues[series].avgVal;
        const valRange = valRanges[series];
        let addedVal = addedVals[series];
        const randomFactor = avgVal * Math.random() * 0.1;
        addedVal = Math.max(minVal, addedVal - (valRange * multiplier)) + randomFactor;
        completeData.push({SERIES: series, TIME: time, VALUE: addedVal +''});
        uniqueSeriesTimes.add(seriesTime);

        addedVals[series] = addedVal;
        valRanges[series] = Math.max(avgVal - minVal, 0);
      } else {
        skippedRows++;
      }
    }
  }
}

completeData = completeData
  .filter((row) => row.VALUE && !isNaN(row.VALUE))
  .filter((row, index, self) => {
    const rowKey = `${row.SERIES}_${row.TIME}`;
    return index === self.findIndex(r => `${r.SERIES}_${r.TIME}` === rowKey);
  });

console.log('total parsed rows:', parsedRows.length);
console.log('total days:', endDate.diff(startDate, 'days') + 1);
console.log('total data:', completeData.length);
console.log('skipped rows:', skippedRows);

// Converting data to CSV
completeData = completeData.map((row, i) => {
  const newRow = {...row};
  newRow.VALUE = row.VALUE.replace('.', ',');
  newRow.TIME = row.TIME.replace('24:00', '00:00');
  return newRow;
});

const csvData = completeData.map(row => Object.values(row).join(';'));
const csvContent = headers.join(';') + '\n' + csvData.join('\n');

fs.writeFileSync(`output-complete/${fileName}`, csvContent, 'utf-8');
