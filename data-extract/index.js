const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3();
const bucketName = "website-test-reports";
const downloadDir = "./downloads";
const paramsToExtract = ["type", "provider", "region", "date", "hour"];
const transformedFilesFile = "transformed_files.txt";
const outputDir = "./output";

const transformFile = async (filePath) => {
  const data = fs.readFileSync(filePath);
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
    "performance": audits["performance"]["score"],
  };
  const params = path.parse(filePath).name.split("-");
  const transformedData = { params, results };
  return transformedData;
};

const groupData = (data) => {
  const groups = {};
  data.forEach((item) => {
    const groupKey = paramsToExtract
      .map((param) => item.params[param])
      .join("-");
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });
  return groups;
};

const writeGroupedData = (groups) => {
  Object.keys(groups).forEach((groupKey) => {
    const fileName = `${groupKey}.json`;
    const filePath = path.join(outputDir, fileName);
    const data = groups[groupKey].map((item) => item.results);
    fs.writeFileSync(filePath, JSON.stringify(data));
  });
};

const downloadAndTransformFiles = async () => {
  const transformedFiles = new Set();
  if (fs.existsSync(transformedFilesFile)) {
    const data = fs.readFileSync(transformedFilesFile, "utf8");
    data.split("\n").forEach((line) => {
      if (line) {
        transformedFiles.add(line);
      }
    });
  }
  const s3Params = { Bucket: bucketName };
  const s3Objects = await s3.listObjectsV2(s3Params).promise();
  const s3Files = s3Objects.Contents.filter((obj) => {
    const params = obj.Key.split("-").map((param) => param.trim());
    return (
      params.length === paramsToExtract.length &&
      params.every((param, index) => param === paramsToExtract[index])
    );
  });
  for (const s3File of s3Files) {
    const filePath = path.join(downloadDir, s3File.Key);
    const fileParams = s3File.Key.split("-").map((param) => param.trim());
    if (!transformedFiles.has(s3File.Key)) {
      const s3Params = { Bucket: bucketName, Key: s3File.Key };
      const s3Data = await s3.getObject(s3Params).promise();
      fs.writeFileSync(filePath, s3Data.Body);
      const transformedData = await transformFile(filePath);
      fs.unlinkSync(filePath);
      transformedFiles.add(s3File.Key);
      fs.appendFileSync(transformedFilesFile, `${s3File.Key}\n`);
      transformedData.params = transformedData.params.reduce(
        (obj, param, index) => {
          obj[paramsToExtract[index]] = param;
          return obj;
        },
        {}
      );
      data.push(transformedData);
    }
  }
  const groups = groupData(data);
  writeGroupedData(groups);
};

downloadAndTransformFiles().catch(console.error);