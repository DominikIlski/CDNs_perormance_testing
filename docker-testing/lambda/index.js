const AWS = require('aws-sdk');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const s3 = new AWS.S3();

const runLighthouseTest = async (chrome) => {
  const options = {logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port};
  return await lighthouse(process.env.WEBSITE_URL, options);
};

const runLighthouse = async () => {
  let chrome;
  let runnerResult;

  try {
    chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    runnerResult = await runLighthouseTest(chrome);
  } catch (error) {
    console.error('Error running Lighthouse test. Retrying...', error);
    if (chrome) {
      await chrome.kill();
    }
    chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    runnerResult = await runLighthouseTest(chrome);
  }

  await chrome.kill();

  const reportJSON = JSON.stringify(runnerResult.lhr);
  const currentTime = new Date().toISOString().replaceAll(/:/g, '-');
  const reportName = `${process.env.WEBSITE_NAME}-${process.env.REGION}-${currentTime}.json`;

  await writeFile(reportName, reportJSON);

  // const s3Params = {
  //   Bucket: process.env.S3_BUCKET_NAME,
  //   Key: reportName,
  //   Body: reportJSON
  // };
  //
  // await s3.putObject(s3Params).promise();
};

runLighthouse().catch(console.error);
