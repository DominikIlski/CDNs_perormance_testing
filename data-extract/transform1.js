const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputDir = 'output-complete';
const outputDir = 'output-tf1';

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read each file in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Error reading input directory:', err);
    return;
  }

  // Process each file
  files.forEach((file) => {
    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, file);

    // Read the data from the input CSV file
    const transformedData = [];
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        transformedData.push({
          x: row.SERIES,
          y: row.TIME.replace(' ', 'T'),
          value: row.VALUE,
        });
      })
      .on('end', () => {
        // Write the transformed data to a new CSV file in the output directory
        const writer = fs.createWriteStream(outputFile);
        writer.write('x,y,value\n');

        transformedData.forEach((row) => {
          writer.write(`${row.x},${row.y},${row.value}\n`);
        });

        console.log(`Transformed file saved: ${outputFile}`);
      });
  });
});
