const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const s3 = new AWS.S3();
const bucketName = "website-test-reports";
const downloadDir = "./downloads";
const paramsToExtract = ["type", "provider", "region", "date", "hour"];
const transformedFilesFile = "transformed_files.txt";
const outputDir = "./output";

const roundHour = (hour) => {
  return hour < 11 && hour > 4 ? "06:00" : hour < 15 ? "12:00" : hour < 23 ? "18:00" : "24:00";
}

const groupDataByParameter = (data) => {
  const groups = {};
  data.forEach((item) => {
    Object.entries(item.results).forEach(([parameter, value]) => {
      if (!groups[parameter]) {
        groups[parameter] = {};
      }
      const seriesKey = item.params.slice(0, 3).join("_");
      if (!groups[parameter][seriesKey]) {
        groups[parameter][seriesKey] = [];
      }
      const timeKey = item.params.slice(3).join("T");
      groups[parameter][seriesKey].push({ time: timeKey, value });
    });
  });
  return groups;
};

const writeGroupedData = (groups) => {
  Object.entries(groups).forEach(([parameter, seriesData]) => {
    const dataToWrite = Object.entries(seriesData).flatMap(([seriesKey, timeData]) => {
      return timeData.map(measurement => {
        return {
          series: seriesKey,
          time: measurement.time,
          value: measurement.value
        };
      });
    });
    const csvWriter = createCsvWriter({
      path: `${outputDir}/${parameter}.csv`,
      header: [
        {id: 'series', title: 'SERIES'},
        {id: 'time', title: 'TIME'},
        {id: 'value', title: 'VALUE'},
      ],
    });
    csvWriter.writeRecords(dataToWrite).then(() => {
      console.log(`File "${parameter}.csv" has been written successfully.`);
    }).catch((error) => {
      console.error(`Failed to write file "${parameter}.csv".`, error);
    });
  });
};


const transformFile = async (fileName, data) => {
  const jsonData = JSON.parse(data);
  const audits = jsonData["audits"];
  const results = {
    "first-meaningful-paint": audits["first-meaningful-paint"]["numericValue"],
    "first-contentful-paint": audits["first-contentful-paint"]["numericValue"],
    "cumulative-layout-shift": audits["cumulative-layout-shift"]["numericValue"],
    "max-potential-fid": audits["max-potential-fid"]["numericValue"],
    "speed-index": audits["speed-index"]["numericValue"],
    "interactive": audits["interactive"]["numericValue"],
    "server-response-time": audits["server-response-time"]["numericValue"],
    "performance": jsonData["categories"]["performance"]["score"],
  };
  const [typeAndProvider, reg1, reg2, reg3, day, month, year, time] = fileName.split("-")
    .map((param) => param.trim());
  const params = [...typeAndProvider.split('_'),
    [reg1,reg2,reg3].join('-'), [day,month,year].join('-'), time.split('.')[0]];

  params[4] = roundHour(params[4]);
  const transformedData = { params, results };
  return transformedData;
};


const downloadAndTransformFiles = async () => {
  const transformedFiles = new Set();
  const data = [];
  if (fs.existsSync(transformedFilesFile)) {
    const data = fs.readFileSync(transformedFilesFile, "utf8");
    data.split("\n").forEach((line) => {
      if (line) {
        transformedFiles.add(line);
      }
    });
  }
  const s3Params = { Bucket: bucketName };
  const s3Objects = (await s3.listObjectsV2(s3Params).promise()).Contents;

  for (const s3File of s3Objects) {
    const filePath = path.join(downloadDir, s3File.Key);
    if (!transformedFiles.has(s3File.Key)) {

      const s3Params = { Bucket: bucketName, Key: s3File.Key};
      const s3Data = await s3.getObject(s3Params).promise();
      const transformedData = await transformFile(s3File.Key, s3Data.Body.toString());
      transformedFiles.add(s3File.Key);
      fs.appendFileSync(transformedFilesFile, `${s3File.Key}\n`);
      data.push(transformedData);
    }
  }
  if(!data.length) {
    throw Error('All data has been processed');
  }
  const groups = groupDataByParameter(data)
  writeGroupedData(groups);
  return 'Finished!';
};

downloadAndTransformFiles().then((e) => console.log(e)).catch((e) => console.log(e));
