const puppeteer = require('puppeteer');

let browser;
let page;
let frame;
let UIConsoleCurrentIndex;

async function launchBrowser(experimentalflag, callback) {
    if (experimentalflag) {
        browser = await puppeteer.launch({
            defaultViewport: null,
            headless: false,
            slowMo: 80,
            args: ['--window-size=1380,780', "--flag-switches-begin", "--enable-experimental-web-platform-features", "--flag-switches-end"]
        })
    }
    else {
        browser = await puppeteer.launch({
            defaultViewport: null,
            headless: false,
            slowMo: 80,
            args: ['--window-size=1380,780', "--flag-switches-begin", "--disable-experimental-web-platform-features", "--flag-switches-end"]
        })
    }
    page = await browser.newPage();
    await page.goto(
        'https://qa-app.codingrooms.com/c-join/c/s0mVU1fKm5Cy/ludJTf'
    )

    callback();
}

async function startTests(callback) {
    launchBrowser(true, async function () {
        await delay(10000);
        try {

            const framesList = (await page.frames());

            frame = await getFrame(framesList, "SPIKE iframe");

            await frame.click('#Service_SPIKE');

        }
        catch (e) {
            console.log(e);
        }
    });
}

getFrame = async function (frames, ssoFrameTitle) {
    let selectedFrame;
    for (let i = 0; i < frames.length; ++i) {
        let frameTitle = await frames[i].title();
        if (frameTitle === ssoFrameTitle) {
            selectedFrame = frames[i];
            break;
        }
    }
    return selectedFrame;
}

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

startTests();
