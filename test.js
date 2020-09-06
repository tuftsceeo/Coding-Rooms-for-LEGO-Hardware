const puppeteer = require('puppeteer');

let browser;
let page;
let frame;
let UIConsoleCurrentIndex;

async function launchBrowser(callback) {
    browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        slowMo: 80,
        args: ['--window-size=1380,780', "--flag-switches-begin", "--enable-experimental-web-platform-features", "--flag-switches-end"]
    })
    page = await browser.newPage();
    await page.goto(
        'file:///Users/jang-hojung/tuftsceeo/SPIKEstuff/src/codingroomsHardware/index.html'
    )

    callback();
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
    page.$eval("#testLongCode > span#status", element => element.innerHTML = "In progess");

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
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
        + "#commmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommmentcommment\n"
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
    page.$eval("#testTabEscapeCode > span#status", element => element.innerHTML = "In progess");

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
    page.$eval("#testSyntaxErrorModuleImports > span#status", element => element.innerHTML = "In progess");

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
    page.$eval("#testSyntaxErrorCode > span#status", element => element.innerHTML = "In progess");

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
    page.$eval("#testEmptyCode > span#status", element => element.innerHTML = "In progess");

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



async function startTests(callback) {
    launchBrowser( async function () {
        try {

            const framesList = (await page.frames());

            frame = await getFrame(framesList, "SPIKE iframe");

            await frame.click('#Service_SPIKE');

            await delay(10000);

            console.log("delay ended");

            testUIInit();

            await delay(3000);

            // run default code
            await testDefaultCode();

            await delay(5000);

            await testPrintCode();

            await delay(5000);

            await testLongCode();

            await delay(5000);

            await testTabEscapeCode();

            await delay(5000);

            await testSyntaxErrorModuleImports();

            await delay(5000);

            await testSyntaxErrorCode();

            await delay(5000);

            await testEmptyCode();

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