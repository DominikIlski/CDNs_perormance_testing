const fs = require('fs');
const moment = require('moment');

// Set the range of the dates
const startDate = moment("15-06-2023", "DD-MM-YYYY");
const endDate = moment("21-06-2023", "DD-MM-YYYY");

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
const values = parsedRows.map(row => parseFloat(row.VALUE))

// For each day in the date range
for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
  // For each series
  for (const series of combinations) {
    // For each hour
    for (const hour of hours) {
      const time = `${date.format('DD-MM-YYYY')}T${hour}:00`;
      const seriesTime = `${series}_${time}`;

      // If this combination of series and time doesn't exist, create a random value for it
      if (!uniqueSeriesTimes.has(seriesTime)) {
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const value = Math.random() * (maxVal - minVal) + minVal;
        completeData.push({SERIES: series, TIME: time, VALUE: value});
        uniqueSeriesTimes.add(seriesTime);
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
const csvData = completeData.map(row => Object.values(row).join(','));
const csvContent = headers.join(',') + '\n' + csvData.join('\n');

fs.writeFileSync(`output-complete/${fileName}`, csvContent, 'utf-8');
