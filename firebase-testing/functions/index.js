const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const donenv = require("dotenv");
donenv.config();
const pages = [
    "https://x-kom.pl",
    "https://morele.net",
    "https://komputronik.pl",
];

const GOOGLE_URL =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=";
const KEY = proccess.env.GOOGLE_API_KEY;

const normalCron = "0 6,12,18,24 * 6 *";
const morningOnEventsCron = "*/12 5-12 27,30 11 *";
const onEventsCron = "0 13-21 27,30 11 *";

admin.initializeApp(functions.config().firebase);

const runtimeOpts = {
    timeoutSeconds: 300,
};

const url = (url) => `${GOOGLE_URL}${url}&key=${KEY}`;

const db = admin.firestore();
const googleRef = db.collection("google");

exports.fetchGoogle = functions
    .runWith(runtimeOpts)
    .region("europe-west1")
    .pubsub.schedule(normalCron)
    .timeZone("Europe/Warsaw")
    .onRun(async () => await google());

exports.fetchGoogleMorningOnEvents = functions
    .runWith(runtimeOpts)
    .region("europe-west1")
    .pubsub.schedule(morningOnEventsCron)
    .timeZone("Europe/Warsaw")
    .onRun(async () => await google());

exports.fetchGoogleOnEvents = functions
    .runWith(runtimeOpts)
    .region("europe-west1")
    .pubsub.schedule(onEventsCron)
    .timeZone("Europe/Warsaw")
    .onRun(async () => await google());

exports.googleValues = functions.https.onRequest(async (_req, res) =>
    res.set("Access-Control-Allow-Origin", "*").json(await getDocs(googleRef))
);

const google = async () => {
    for (let page of pages) {
        const response = await fetch(url(page)).then((res) => res.json());

        const { audits } = response.lighthouseResult;

        const data = {
            firstContentfulPaint: audits["first-contentful-paint"].numericValue,
            speedIndex: audits["speed-index"].numericValue,
            timeToInteractive: audits["interactive"].numericValue,
            firstMeaningfulPaint: audits["first-meaningful-paint"].numericValue,
            firstCpuIdle: audits["first-cpu-idle"].numericValue,
            estimatedInputLatency:
                audits["estimated-input-latency"].numericValue,
            maxPotentialFid: audits["max-potential-fid"].numericValue,
            cumulativeLayoutShift:
                audits["cumulative-layout-shift"].numericValue,
            totalBlockingTime: audits["total-blocking-time"].numericValue,
            bootupTime: audits["bootup-time"].numericValue,
            serverResponseTime: audits["server-response-time"].numericValue,
            page,
            fetchingDate: +new Date(),
        };

        await googleRef.doc().set(data, { ignoreUndefinedProperties: true });
    }
};

const getDocs = async (ref) => (await ref.get()).docs.map((doc) => doc.data());