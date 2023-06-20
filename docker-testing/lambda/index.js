import AWS from "aws-sdk";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import fs from "fs";
import util from "util";

const writeFile = util.promisify(fs.writeFile);

const s3 = new AWS.S3();

console.log("Starting Lighthouse test...");

const runLighthouseTest = async () => {
  const options = {
    output: "json",
    onlyCategories: ["performance"],
    port: 9222,
    preset: "desktop",
    "disable-full-page-screenshot": true,
    chromeFlags: [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  };
  return await lighthouse(process.env.WEBSITE_URL, options, {
    extends: "lighthouse:default",
    settings: {
      onlyAudits: [
        "first-meaningful-paint",
        "first-contentful-paint",
        "cumulative-layout-shift",
        "max-potential-fid",
        "speed-index",
        "interactive",
        "network-server-latency",
        "server-response-time",
      ],
    },
  });
};

const runLighthouse = async () => {
  let chrome;
  let runnerResult;

  try {
    console.log("Launching Chrome headless...");
    // chrome = await chromeLauncher.launch({chromeFlags: ['--headless, --disable-gpu'], chromePath: '/usr/bin/google-chrome'});
    chrome = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-gpu", "--remote-debugging-port=9222"],
      executablePath: "/usr/bin/google-chrome",
      headless: "new",
      ignoreHTTPSErrors: true,
    });

    runnerResult = await runLighthouseTest(chrome);
  } catch (error) {
    console.error("Error running Lighthouse test. Retrying...", error);
    if (chrome) {
      await chrome.close();
    }
    console.log("Launching Chrome headless...");
    chrome = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-gpu", "--remote-debugging-port=9222"],
      executablePath: "/usr/bin/google-chrome",
      headless: "new",
      ignoreHTTPSErrors: true,
    });
    runnerResult = await runLighthouseTest(chrome);
  }

  await chrome.close();

  console.log("Writing report to file...");
  const currentTime = new Date().toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
  });
  const [date, hour, year, time] = currentTime.split(/[\/\s,:]+/);
  const reportName = `${process.env.WEBSITE_NAME}-${process.env.REGION}-${date.replaceAll('.','-')}-${hour}.json`;
  const reportJSON = JSON.stringify(runnerResult.lhr);
  await writeFile('./reports/' + reportName, reportJSON, 'utf8')
  console.log(`Report written to ${reportName}`);

  console.log("Uploading report to S3...");
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: reportName,
    Body: reportJSON,
  };

  await s3.putObject(s3Params).promise();
  console.log("Lighthouse test complete!");
  fs.unlinkSync('./reports/' + reportName);
  console.log(`Report file ${reportName} removed`);

  console.log("Lighthouse test complete!");
};

runLighthouse().catch(console.error);
