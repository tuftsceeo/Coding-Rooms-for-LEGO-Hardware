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
        'file:///Users/jang-hojung/tuftsceeo/SPIKEstuff/src/codingroomsHardware/index.html'
    )

    callback();
}
async function testStreamUJSONRPC() {
    console.log("##### TESTING streamUJSONRPC #####");
    
    
    var testsResult = await frame.evaluate( async () => {
        var UJSONRPCtests = {
            1: ['{ "m": 2, "p": ', '[8.326, 100] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -176, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 9, 7]], [62, [10]], [4, -8, 989], [0, 0, 0], [-4, ', '0, 0], "", 0] }\r{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49', ', [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -8, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, ', 'null, 7, 7, 7]], [62, [', '10]]', ', [4, -6, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0', ', 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]', '], [62, [10]], [4, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109', ', 0]], [48, ', '[0, 0, -177, 0]], ', '[49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 8, 9, 7]], [62, [10]], [4, -6, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, ', '0, -176, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61', ', [1, null, 7, 9, 7]], [62, [10]], [4, -6, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48', ', [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [4, -', '6, 992], [0, 0, 0], [-4, 0, 0], ""', ', 0] }\r', '{ "m": 0, "p": [[48, [0, 0, ', '109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [', '62, [10]], [4, -5, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, ', '[0, 0, -176, 0]], [49, [0, 0, ', '166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -6, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, ', '109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [5, -8', ', 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0', ', "p": [[48, [0, 0, 109, 0]], [', '48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [3, -10, 991], [', '0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, ', '0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, n', 'ull, 7, 9, 7]], [62, [10]], [4, -5, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48', ', [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], ', '[62, [10]], ', '[5, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ ', '"m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [2, -8, ', '989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0', ']], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0', ']], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [', '[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [4, -8, 991], ', '[0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [', '0, 0, 109, 0]], [48, [0, 0, -176, 0]], [49, [0, 0, 166, 0]], [63, [0, ', '0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [4, -6, 990], [0, 0, 0', '], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0', ', 0, 109, 0]], [48, [0, ', '0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -6, 992], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, ', '7, 7]], [62, [10]], [6, -6, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r{ "m": 2, "p": [8.323, 100] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -6, 991], [0, 0, 0], [-4, ', '0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, ', '[0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -5, 991], [0, 0, 0], [-4, 0, ', '0], "", 0] }\r', '{ "m": 0, "p": [[48, [', '0, 0, 109, 0]], [48, [0, 0, -177, 0]], [', '49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 8, 9, 7]], [62, [10]], [5, -7, 991], [0, 0, 0], [-4, ', '0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, ', '0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1', ', null, 7, 9, 7]], [62, [10', ']], [4, -7, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0', ', "p": [[48, [0, 0, 109, 0', ']], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]', '], [4, -5, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [', '[48, [0, 0, 1', '09, 0]], [48, [', '0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -7, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [', '[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [', '61, [1, null, 7, 7, 7]], [62, [10]], [5, -7, 991], [0, 0, 0], [-4', ', 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [6, -5, 989], [0, 0, 0], [-4, 0, 0], ', '"", 0] }\r', '{ "m": 0, "p": [[48, ', '[0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [', '1, null, 7, 7, 7]]', ', [62, [10]], [4, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0', ', "p": [[48, [0, 0, 109, 0]], [48, [0, ', '0, -177, 0]], [49, [0, ', '0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], ', '[3, -6, 992], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109', ', 0]], [48, [0, 0, -176, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]', '], [4, ', ' -8, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [', '61, [1, null, 7, 7, 7]], [62, [10]], [5, -6, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], ', '[48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -7, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0', ', "p": [[48, [', '0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, ', 'null, 7, 7, 7]], [62, [10]], [4, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [', '0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [5, -6, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[', '48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [4, -7, 990], [0, 0, 0]', ', [-4, 0, 0], "", 0]', '}\r', '{ "m": 0, "p": [[48, [0, 0, ', '109, 0]], [48, [0, 0, -176, 0]], [49, [0, 0, 166, ', '0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10]], [3, -7, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, ', '[0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]]', ', [62, [10]], [5, -6, 990]', ', [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0', ', "p": [[48, ', '[0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -6, ', '992], [0, 0, 0], [-4, 0, 0], "", 0]', '}\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0', ', 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -8, 992], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 2, "p": [8.323, 100] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, ', '[0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, ', '384]], [61, [1, null, 7, 7, 7]], [62, [10]], [5, -7, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, ', '109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 8, 9, 7]], [62', ', [10]], [3, -6, 990], [0, 0, 0], [-4', ', 0, 0], "", 0] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [', '10]], [4, -6, 991], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [', '48, [0, 0, -177, 0]], ', '[49, [0, 0, 166, 0]], [63, [0, 0, 383]], [61, [1, null, 7, 7, 7]], [62, [10]], [4, -8, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": ', '[[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]', '], [62, [1', '0]], [4, -6, 989], [0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, [0', ', 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 7, 7]], [62, [10]], [3, -7, 992], [', '0, 0, 0], [-4, 0, 0], "", 0] }\r', '{ "m": 0, "p": [[48, ', '[0, 0, ', '109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 8, 9, 7]], [62, [10]], [', '3,-7, 989], [0, 0, 0], [-4, 0, 0], "", 0]}\r', '{ "m": 0, "p": [[', '48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], ', '[61, [1, null, 7, 9, 7]], [62, [10]], [4, -6, 990], [0, 0, 0], [-4, 0, 0], "", 0] }\r ', '{ "m": 0, "p": [[48, [0, 0, 109, 0]], [48, [0, 0, -177, 0]], [49, [0, 0, 166, 0]], [63, [0, 0, 384]], [61, [1, null, 7, 9, 7]], [62, [10', ']], [4, -7, 990], [0, 0, 0], [-4, 0, 0], ', '"", 0] }\r {"i": "ECSn", "r": ', '{ "blocksize": 512', ', "transferid": "53766" }', '}\r']
        }
        var result = await mySPIKE.testStreamUJSONRPC(UJSONRPCtests);
        return result;
    })


    for (var index = 0; index < testsResult.length; index++ ) {
        var caseSuccess = testsResult[index];

        if (caseSuccess) {
            success = false;
            page.$eval("#testCase" + index + " > span#status", element => element.innerHTML = "Passed");
        }
        else {
            page.$eval("#testCase" + index + "> span#status", element => element.innerHTML = "Failed");
        }
    }
    
    // if (success) {
        // page.$eval("#testCase1 > span#status", element => element.innerHTML = "Passed");
    // }
    // else {
        // page.$eval("#testCase1 > span#status", element => element.innerHTML = "Failed");
    // }



}

async function testUIInit() {
    console.log("##### TESTING HUB PROGRAMS #####");
    /* CHECK 1: check hub storage reading */
    page.$eval("#testFirstPositionNotEmpty > span#status", element => element.innerHTML = "In progress");

    const firstPosition = await frame.evaluate(() => {
        var slotidSelect = document.getElementById("slotidSelect");
        var slotidOption = slotidSelect.options[0];
        return slotidOption.innerHTML;
    })
    
    console.log("Program in first position: ", firstPosition);

    // check if storage position index 0 is not empty (assumes something is in there already)
    if ( firstPosition.indexOf("Empty") <= -1 && firstPosition != "0") {
        page.$eval("#testFirstPositionNotEmpty > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testFirstPositionNotEmpty > span#status", element => element.innerHTML = "Failed");
    }

    /* CHECK 2: check hub name */
    try {
        console.log("##### TESTING HUB NAME #####");
        page.$eval("#testHubName > span#status", element => element.innerHTML = "In progress");

        const hubName = await frame.evaluate(() => {
            var hubNameDiv = document.getElementById("hubNameElement");
            var name = hubNameDiv.innerHTML;
            return name;
        })

        console.log("hub Name: ", hubName);

        if (hubName != "undefined") {
            page.$eval("#testHubName > span#status", element => element.innerHTML = "Passed");
        }
        else {
            page.$eval("#testHubName > span#status", element => element.innerHTML = "Failed");
        }
    }
    // wasnt defined at all
    catch (e) {
        console.log(e);
        page.$eval("#testHubName > span#status", element => element.innerHTML = "Failed");
    }

    /* CHECK 3: if UI console is devoice of errors */
    console.log("##### TESTING UI CONSOLE MESSAGES #####");
    page.$eval("#testConsoleIndex > span#status", element => element.innerHTML = "In progress");

    // check if UI console shows Web UI init complete
    const consoleValue = await frame.$eval("#console", el => el.value);
    console.log("consoleValue: ", consoleValue);
    var index_SucessfullyConnected = consoleValue.indexOf("Web UI initialization complete!")
    console.log("index_SuccessfullyConnected: ", index_SucessfullyConnected);
    
    var expectedResultWithoutErrors = (consoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (consoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (consoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (index_SucessfullyConnected == 81 && expectedResultWithoutErrors) {
        page.$eval("#testConsoleIndex > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testConsoleIndex > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testDefaultCode() {
    page.$eval("#testDefaultCode > span#status", element => element.innerHTML = "In progress");

    console.log(page.$("#runCode"))
    await page.click("#runCode");

    await delay(6000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResult = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1) && (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResult && expectedResultWithoutErrors) {
        page.$eval("#testDefaultCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testDefaultCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testPrintCode() {
    page.$eval("#testPrintCode > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML = 
        "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "print('hello')\n"
        + "hub = PrimeHub()\n"
        + "print('goodbye!!!!!!')\n"
        + "hub.light_matrix.show_image('HAPPY')\n"
        + "twelve = 12\n"
        + "print('integer value is ' + str(twelve))\n"
    );

    await page.click("#runCode");

    await delay(8000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1) && (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1);
    var expectedResultExtra = (nextConsoleValue.indexOf("hello") > -1) && (nextConsoleValue.indexOf("goodbye!!!!!!") > -1) && (nextConsoleValue.indexOf("integer value is 12") > -1);
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultExtra && expectedResultWithoutErrors) {
        page.$eval("#testPrintCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testPrintCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testLongCode() {
    page.$eval("#testLongCode > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML =
        "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "hub = PrimeHub()\n"
        + "hub.light_matrix.off()\n"
        + "hub.light_matrix.show_image('HAPPY')\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuupeeeeeeeeeeeeeeeeeeeeeeeeeeer loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong cOooooooooooooooooooooooooommmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeenttttttttttttttttttttttttttttttttttttt\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "hub.status_light.on('blue')\n"
        + "\n"
        + "doAWhile = True\n"
        + "while doAWhile: \n"
        + "    hub.light_matrix.off()\n"
        + "    for x in range(0, 4):\n"
        + "        wait_for_seconds(1)\n"
        + "        hub.light_matrix.set_pixel(0, x)\n"
        + "        #commment\n"
        + "        doAWhile = False\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
        + "#commment\n"
    );

    await page.click("#runCode");

    await delay(15000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1) && (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1);
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultWithoutErrors) {
        page.$eval("#testLongCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testLongCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testTabEscapeCode() {
    page.$eval("#testTabEscapeCode > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML =
        "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "hub = PrimeHub()\n"
        + "hub.light_matrix.off()\n"
        + "hub.status_light.on('cyan')\n"
        + "\n"
        + "doAWhile = True\n"
        + "while doAWhile: \n"
        + "\thub.light_matrix.off()\n"
        + "\tfor x in range(0, 4):\n"
        + "\t\twait_for_seconds(1)\n"
        + "\t\thub.light_matrix.set_pixel(0, x)\n"
        + "\t\t#commment\n"
        + "\t\tdoAWhile = False\n"
    );

    await page.click("#runCode");

    await delay(12000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1) && (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1);
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultWithoutErrors) {
        page.$eval("#testTabEscapeCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testTabEscapeCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testSyntaxErrorModuleImports(){
    page.$eval("#testSyntaxErrorModuleImports > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML =
        "from spike import PrimeHub, LightMatrix, Motor, MotorPai\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "hub = PrimeHub()\n"
        + "hub.light_matrix.off()\n"
        + "hub.status_light.on('cyan')\n"
        + "\n"
        + "doAWhile = True\n"
        + "while doAWhile: \n"
        + "\thub.light_matrix.off()\n"
        + "\tfor x in range(0, 4):\n"
        + "\t\twait_for_seconds(1)\n"
        + "\t\thub.light_matrix.set_pixel(0, x)\n"
        + "\t\t#commment\n"
        + "\t\tdoAWhile = False\n"
    );

    await page.click("#runCode");

    await delay(7000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1) && (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1);
    var expectedResultExtra = (nextConsoleValue.indexOf("ImportError: no module named 'spike.MotorPai'") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultExtra & expectedResultWithoutErrors) {
        page.$eval("#testSyntaxErrorModuleImports > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testSyntaxErrorModuleImports > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;
}

async function testSyntaxErrorCode() {
    page.$eval("#testSyntaxErrorCode > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML =
        "from spike import PrimeHub, LightMatrix, Motor, MotorPai\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "hub = PrimeHub()\n"
        + "hub.light_matrix.off()\n"
        + "hub.status_light.on('cyan'\n"
        + "\n"
        + "doAWhile = True\n"
        + "while doAWhile: \n"
        + "\thub.light_matrix.off()\n"
        + "\tfor x in range(0, 4):\n"
        + "\t\twait_for_seconds(1)\n"
        + "\t\thub.light_matrix.set_pixel(0, x)\n"
        + "\t\t#commment\n"
        + "\t\tdoAWhile = False\n"
    );

    await page.click("#runCode");

    await delay(7000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1)
    var expectedResultExtra = (nextConsoleValue.indexOf("line 7: SyntaxError: invalid syntax") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultExtra && expectedResultWithoutErrors) {
        page.$eval("#testSyntaxErrorCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testSyntaxErrorCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;
}

async function testEmptyCode() {
    page.$eval("#testEmptyCode > span#status", element => element.innerHTML = "In progress");

    await page.$eval("#filecontent", element => element.innerHTML =
        ""
    );

    await page.click("#runCode");

    await delay(7000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 0...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 0...") > -1)
    var expectedResultExtra = (nextConsoleValue.indexOf("line 3: SyntaxError: invalid syntax") > -1)

    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultExtra && expectedResultWithoutErrors) {
        page.$eval("#testEmptyCode > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testEmptyCode > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;
}

async function testCodeInSlotTen() {
    page.$eval("#testCodeInSlotTen > span#status", element => element.innerHTML = "In progress");

    var printContent = await page.evaluate( () => {
        // get random print content
        var selection = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        var printContent = "";

        for (var i = 0; i < 10; i++) {
            var randomInteger = Math.floor(Math.random() * 10);
            printContent = printContent + selection[randomInteger];
        }

        var fileContent = document.getElementById("filecontent");

        var codeContent = "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
            + "from spike.control import wait_for_seconds, wait_until, Timer\n"
            + "print('" + printContent + "')\n"
            + "hub = PrimeHub()\n"
            + "hub.light_matrix.show_image('HAPPY')\n"

        fileContent.innerHTML = codeContent;

        return printContent;
    })

    console.log("looking for print statement with: ", printContent);
    
    await frame.select("select#slotidSelect", "slot10");
    
    await delay(1000);

    await page.click("#runCode");
    
    await delay(5000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    /* CHECK 1: check all expected statements in UI console */

    var expectedResultBase = (nextConsoleValue.indexOf("Writing new program to position 10...") > -1) && (nextConsoleValue.indexOf("Terminating any running program...") > -1) && (nextConsoleValue.indexOf("Executing program in position 10...") > -1)
    var expectedResultExtra = (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf(printContent) > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1)
    
    console.log((nextConsoleValue.indexOf(printContent) > -1));
    
    if (expectedResultBase && expectedResultExtra && expectedResultWithoutErrors) {
        page.$eval("#testCodeInSlotTen > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testCodeInSlotTen > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

    // revert to slot 0

    await frame.select("select#slotidSelect", "slot0");

}

async function defaultFileContent() {
    await page.$eval("#filecontent", element => element.innerHTML =
        "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
        + "from spike.control import wait_for_seconds, wait_until, Timer\n"
        + "print('hello')\n"
        + "hub = PrimeHub()\n"
        + "hub.light_matrix.show_image('HAPPY')\n"
    );

    await page.click("#runCode");

    await delay(5000);

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    UIConsoleCurrentIndex = consoleValue.length;
}

async function testRun() {

    console.log("##### testing run button ######")

    page.$eval("#testRunButton > span#status", element => element.innerHTML = "In progress");

    await frame.click("#runProgram");

    await delay(3000);
    
    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    var expectedResultBase = (nextConsoleValue.indexOf("Executing program in position 0...") > -1)
    var expectedResultExtra = (nextConsoleValue.indexOf(">>> Program started!") > -1) && (nextConsoleValue.indexOf("hello") > -1) && (nextConsoleValue.indexOf(">>> Program finished!") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 
    
    if (expectedResultBase && expectedResultExtra && expectedResultWithoutErrors) {
        page.$eval("#testRunButton > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testRunButton > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testStop() {
    console.log("##### testing stop button ######")

    page.$eval("#testStopButton > span#status", element => element.innerHTML = "In progress");

    await frame.click("#stopProgram");

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);
    
    var expectedResultBase = (nextConsoleValue.indexOf("Terminating any running program...") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultWithoutErrors) {
        page.$eval("#testStopButton > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testStopButton > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testReboot() {
    console.log("##### testing reboot button ######")

    page.$eval("#testRebootButton > span#status", element => element.innerHTML = "In progress");

    await frame.click("#rebootHub");

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);


    var expectedResultBase = (nextConsoleValue.indexOf("Rebooting SPIKE Prime Hub...") > -1)
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1) 

    if (expectedResultBase && expectedResultWithoutErrors) {
        page.$eval("#testRebootButton > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testRebootButton > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testDisconnectAndReconnect() {
    
    page.$eval("#testPromptAfterDisconnect > span#status", element => element.innerHTML = "In progress");
    
    await page.$eval("#filecontent", element => element.innerHTML =
    "from spike import PrimeHub, LightMatrix, Motor, MotorPair\n"
    + "from spike.control import wait_for_seconds, wait_until, Timer\n"
    + "print('hello')\n"
    + "hub = PrimeHub()\n"
    + "hub.light_matrix.show_image('HAPPY')\n"
    );
    
    await page.evaluate(() => {
        alert("Disconnect your SPIKE Prime now");
    })
    
    await delay(12000)

    // check connection guide display
    
    var display = await frame.$eval("#connectionHelp_container", element => element.style.display);
    console.log("display of connectionHelp: ", display);
    
    if (display == "block") {
        page.$eval("#testPromptAfterDisconnect > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testPromptAfterDisconnect > span#status", element => element.innerHTML = "Failed");
    }
    
    await page.evaluate(() => {
        alert("Turn on and reconnect your SPIKE Prime now");
    })

    page.$eval("#testReconnect > span#status", element => element.innerHTML = "In progress");
    
    await delay(12000);

    // check ability to reconnect 

    const consoleValue = await frame.$eval("#console", el => el.value);
    var nextConsoleValue = consoleValue.substring(UIConsoleCurrentIndex, consoleValue.length);
    console.log("next console value: ", nextConsoleValue);

    var expectedResultBase = (nextConsoleValue.indexOf("SPIKE Prime hub has been disconnected") > -1) && (nextConsoleValue.indexOf("Successfully connected to SPIKE Prime!") > -1) && (nextConsoleValue.indexOf("Reading registered programs in the hub...") > -1) && (nextConsoleValue.indexOf("Web UI initialization complete!") > -1) 
    var expectedResultWithoutErrors = (nextConsoleValue.indexOf("Please try again. If error persists, refresh this environment.") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime") == -1) && (nextConsoleValue.indexOf("Fatal Error: Please reboot the Hub and refresh this environment") == -1)

    if (expectedResultBase && expectedResultWithoutErrors) {
        page.$eval("#testReconnect > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testReconnect > span#status", element => element.innerHTML = "Failed");
    }

    UIConsoleCurrentIndex = consoleValue.length;

}

async function testDependenciesInfo() {

    page.$eval("#testDependenciesInfo > span#status", element => element.innerHTML = "In progress");

    var SecondBrowser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        slowMo: 80,
        args: ['--window-size=1380,780', "--flag-switches-begin", "--disable-experimental-web-platform-features", "--flag-switches-end"]
    })
    SecondPage = await SecondBrowser.newPage();
    await SecondPage.goto(
        'file:///Users/jang-hojung/tuftsceeo/SPIKEstuff/src/codingroomsHardware/index.html'
    )

    const framesList = (await SecondPage.frames());

    SecondFrame = await getFrame(framesList, "SPIKE iframe");

    var display = await SecondFrame.$eval("#dependenciesInfo", element => element.style.display);
    console.log("display of dependenciesInfo: ", display);

    if (display == "block") {
        page.$eval("#testDependenciesInfo > span#status", element => element.innerHTML = "Passed");
    }
    else {
        page.$eval("#testDependenciesInfo > span#status", element => element.innerHTML = "Failed");
    }

    await SecondBrowser.close();

}

async function startTests(callback) {
    launchBrowser(true, async function () {
        try {

            const framesList = (await page.frames());

            frame = await getFrame(framesList, "SPIKE iframe");

            await testStreamUJSONRPC();

            await frame.click('#Service_SPIKE');

            await delay(14000); // wait for UI init

            testUIInit();
            await delay(3000);

            // run default code
            await testDefaultCode();

            await testPrintCode();

            await testLongCode();

            await testTabEscapeCode();

            await testSyntaxErrorModuleImports();

            await testSyntaxErrorCode();

            await testEmptyCode();

            await testCodeInSlotTen();

            await delay(5000);

            await defaultFileContent();
            await delay(1000);

            await testRun();
            await delay(5000);

            await testStop();
            await delay(3000);

            await testReboot();
            await delay(5000);

            await testDisconnectAndReconnect();
            await delay(1000);

            await testDependenciesInfo();
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