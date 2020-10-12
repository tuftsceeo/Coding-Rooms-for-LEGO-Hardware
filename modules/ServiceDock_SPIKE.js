/*
Project Name: SPIKE Prime Web Interface
File name: ServiceDock_SPIKE.js
Author: Jeremy Jung
Last update: 7/19/20
Description: HTML Element definition for <service-spike> to be used in ServiceDocks
Credits/inspirations:
History:
    Created by Jeremy on 7/16/20
LICENSE: MIT
(C) Tufts Center for Engineering Education and Outreach (CEEO)
*/

// import { Service_SPIKE } from "./Service_SPIKE.js";

class servicespike extends HTMLElement {   

    constructor () {
        super();

        var active = false; // whether the service was activated
        this.service = new Service_SPIKE(); // instantiate a service object ( one object per button )

        this.service.executeAfterDisconnect(function () {
            status.style.backgroundColor = "red";
            active = false;
        })

        // Create a shadow root
        var shadow = this.attachShadow({ mode: 'open' });

        /* wrapper definition and CSS */

        var wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'wrapper');
        wrapper.setAttribute("style", "width: 50px; height: 50px; position: relative; margin-top: 10px;")

        /* ServiceDock button definition and CSS */ 

        var button = document.createElement("button");
        button.setAttribute("id", "sl_button");
        button.setAttribute("class", "SD_button");

        var imageRelPath = "./modules/views/SPIKE_Button.png"
        var length = 50; // for width and height of button
        var buttonBackgroundColor = "#A2E1EF" // background color of the button
        var buttonStyle = "width:" + length + "px; height:" + length + "px; background: url(" + imageRelPath + ") no-repeat; background-size: 57px 57px;" 
            + "border: none; background-position: center; cursor: pointer; border-radius: 10px; position: relative;"
        button.setAttribute("style", buttonStyle);

        /* status circle definition and CSS */

        var status = document.createElement("div");
        status.setAttribute("class", "status");
        var length = 16; // for width and height of circle
        var statusBackgroundColor = "red" // default background color of service (inactive color)
        var posLeft = 32;
        var posTop = -20;
        var statusStyle = "border-radius: 50%; height:" + length + "px; width:" + length + "px; background-color:" + statusBackgroundColor +
            "; position: relative; left:" + posLeft + "px; top:" + posTop + "px;";
        status.setAttribute("style", statusStyle);

        /* tooltip CSS */
        var tooltip = document.createElement("span");
        tooltip.innerHTML = "Connect to SPIKE Prime"
        var tooltipStyle = "visibility: hidden; width: 150%; background-color: #555; color: #fff; text-align: center; padding: 5px 0; border-radius: 6px; /* Position the tooltip text */ position: absolute; top: 30px; z-index: 1; left: 10%; /* Fade in tooltip */ opacity: 0; transition: opacity 0.3s; transition-delay: 0.5s;"
        tooltip.setAttribute("style", tooltipStyle);
        
        /* event listeners */
        
        button.addEventListener("mouseleave", function (event) {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        });

        button.addEventListener("mouseenter", function (event) {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";
        })

        button.addEventListener("focus", function () {
            button.style.outline = "0";
        })

        // when ServiceDock button is double clicked
        this.addEventListener("click", async function () {
            // check active flag so once activated, the service doesnt reinit
            if (!active) {
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"activating service");
                var initSuccessful = await this.service.init();
                if (initSuccessful) {
                    active = true;
                    status.style.backgroundColor = "green";
                }
            }
            
        });


        shadow.appendChild(wrapper);
        button.appendChild(status);
        button.appendChild(tooltip);
        wrapper.appendChild(button);

    }

    /* get the Service_SPIKE object */
    getService() {
        return this.service;
    }

    /* get whether the ServiceDock button was clicked */
    isActive() {
        return this.active;
    }

}

// when defining custom element, the name must have at least one - dash 
window.customElements.define('service-spike', servicespike);

/*
Project Name: SPIKE Prime Web Interface
File name: Service_SPIKE.js
Author: Jeremy Jung
Last update: 7/22/20
Description: SPIKE Service Library (OOP)
Credits/inspirations:
    Based on code wrriten by Ethan Danahy, Chris Rogers
History:
    Created by Jeremy on 7/15/20
LICENSE: MIT
(C) Tufts Center for Engineering Education and Outreach (CEEO)
*/


/**
 * @class Service_SPIKE 
 * @example
 * // if you're using ServiceDock
 * var mySPIKE = document.getElemenyById("service_spike").getService();
 * // if you're not using ServiceDock
 * var mySPIKE = new Service_SPIKE();
 * 
 * mySPIKE.init();
 */
function Service_SPIKE() {

    //////////////////////////////////////////
    //                                      //
    //          Global Variables            //
    //                                      //
    //////////////////////////////////////////

    /* private members */

    const VENDOR_ID = 0x0694; // LEGO SPIKE Prime Hub

    // common characters to send (for REPL/uPython on the Hub)
    const CONTROL_C = '\x03'; // CTRL-C character (ETX character)
    const CONTROL_D = '\x04'; // CTRL-D character (EOT character)
    const RETURN = '\x0D';	// RETURN key (enter, new line)

    /* using this filter in webserial setup will only take serial ports*/
    const filter = {
        usbVendorId: VENDOR_ID

    };

    // define for communication
    let port;
    let reader;
    let writer;
    let value;
    let done;
    let writableStreamClosed;

    // for testing program efficiency
    var countProcessedUJSONRPC = 0;
    var countPrimeHubEventHandlerUJSONRPC = 0;
    var countHubInfoUpdateUJSONRPC = 0;
    var totalUJSONRPCProcessed = [];
    var totalUJSONRPCPrimeHubEventHandled = [];
    var totalUJSONRPCHubInfoUpdated = [];
    //define for json concatenation
    let jsonline = "";

    // contains latest full json object from SPIKE readings
    let lastUJSONRPC;

    // object containing real-time info on devices connected to each port of SPIKE Prime 
    let ports =
    {
        "A": { "device": "none", "data": {} },
        "B": { "device": "none", "data": {} },
        "C": { "device": "none", "data": {} },
        "D": { "device": "none", "data": {} },
        "E": { "device": "none", "data": {} },
        "F": { "device": "none", "data": {} }
    };

    // object containing real-time info on hub sensor values
    /*
        !say the usb wire is the nose of the spike prime

        ( looks at which side of the hub is facing up)
        gyro[0] - up/down detector ( down: 1000, up: -1000, neutral: 0)
        gyro[1] - rightside/leftside detector ( leftside : 1000 , rightside: -1000, neutal: 0 )
        gyro[2] - front/back detector ( front: 1000, back: -1000, neutral: 0 )

        ( assume the usb wire port is the nose of the spike prime )
        accel[0] - roll acceleration (roll to right: -, roll to left: +)
        accel[1] - pitch acceleration (up: +, down: -)
        accel[2] - yaw acceleration (counterclockwise: +. clockwise: -)

        ()
        pos[0] - yaw angle
        pos[1] - pitch angle
        pos[2] - roll angle

    */
    let hub = 
    {
        "gyro": [0,0,0],
        "accel": [0,0,0],
        "pos": [0,0,0]
    }

    let batteryAmount = 0; // battery [0-100]

    // string containing real-time info on hub events
    let hubFrontEvent;
    
    /*
        up: hub is upright/standing, with the display looking horizontally
        down: hub is upsidedown with the display, with the display looking horizontally
        front: hub's display facing towards the sky
        back: hub's display facing towards the earth
        leftside: hub rotated so that the side to the left of the display is facing the earth
        rightside: hub rotated so that the side to the right of the display is facing the earth
    */
    let lastHubOrientation; //PrimeHub orientation read from caught UJSONRPC 

    /*
        shake
        freefall
    */
    let hubGesture;

    // 
    let hubMainButton = {"pressed": false, "duration": 0};
    
    let hubBluetoothButton = { "pressed": false, "duration": 0 };
    
    let hubLeftButton = { "pressed": false, "duration": 0 };
    
    let hubRightButton = { "pressed": false, "duration": 0 };
    
    /* PrimeHub data storage arrays for was_***() functions */
    let hubGestures = []; // array of hubGestures run since program started or since was_gesture() ran
    let hubButtonPresses = [];
    let hubName = undefined;

    /* SPIKE Prime Projects */
    
    let hubProjects = { "0": "None", 
                    "1": "None", 
                    "2": "None",
                    "3": "None",
                    "4": "None",
                    "5": "None",
                    "6": "None",
                    "7": "None",
                    "8": "None",
                    "9": "None",
                    "10": "None",
                    "11": "None",
                    "12": "None",
                    "13": "None",
                    "14": "None",
                    "15": "None",
                    "16": "None",
                    "17": "None",
                    "18": "None",
                    "19": "None"
                };
    var colorDictionary = {
        0: "BLACK",
        1: "VIOLET",
        3: "BLUE",
        4: "AZURE",
        5: "GREEN",
        7: "YELLOW",
        9: "RED",
        1: "WHITE",
    };

    // true after Force Sensor is pressed, turned to false after reading it for the first time that it is released
    let ForceSensorWasPressed = false;
    
    var micropython_interpreter = false; // whether micropython was reached or not

    let serviceActive = false; //serviceActive flag

    var waitForNewOriFirst = true; //whether the wait_for_new_orientation method would be the first time called

    /* stored callback functions from wait_until functions and etc. */

    var funcAtInit = undefined; // function to call after init of SPIKE Service

    var funcAfterNewGesture = undefined;
    var funcAfterNewOrientation = undefined;

    var funcAfterLeftButtonPress = undefined;
    var funcAfterLeftButtonRelease = undefined;
    var funcAfterRightButtonPress = undefined;
    var funcAfterRightButtonRelease = undefined;

    var funcUntilColor = undefined;
    var funcAfterNewColor = undefined;

    var funcAfterForceSensorPress = undefined;
    var funcAfterForceSensorRelease = undefined;

    /* array that holds the pointers to callback functions to be executed after a UJSONRPC response */
    var responseCallbacks = [];

    // array of information needed for writing program
    var startWriteProgramCallback = undefined; // [message_id, function to execute ]
    var writePackageInformation = undefined; // [ message_id, remaining_data, transfer_id, blocksize]
    var writeProgramCallback = undefined; // callback function to run after a program was successfully written
    var writeProgramSetTimeout = undefined; // setTimeout object for looking for response to start_write_program

    /* callback functions added for Coding ROoms */
    var getFirmwareInfoCallback = undefined;

    var funcAfterPrint = undefined; // function to call for SPIKE python program print statements or errors
    var funcAfterError = undefined; // function to call for errors in ServiceDock

    var funcAfterDisconnect = undefined; // function to call after SPIKE Prime is disconnected
    var funcAfterDisconnectCodingRooms = undefined; // function to call after SPIKE Prime is disconnected (defined in iframe)

    var funcWithStream = undefined; // function to call after every parsed UJSONRPC package

    var triggerCurrentStateCallback = undefined;

    //////////////////////////////////////////
    //                                      //
    //          Public Functions            //
    //                                      //
    //////////////////////////////////////////

    /** <h4> initialize SPIKE_service </h4>
     * <p> Makes prompt in Google Chrome ( Google Chrome Browser needs "Experimental Web Interface" enabled) </p>
     * <p> Starts streaming UJSONRPC </p>
     * <p> <em> this function needs to be executed after executeAfterInit but before all other public functions </em> </p>
     * @public
     * @returns {boolean} True if service was successsfully initialized, false otherwise
     */
    async function init() {

        // reinit variables in the case of hardware disconnection and Service reactivation
        reader = undefined;
        writer = undefined;

        // initialize web serial connection
        var webSerialConnected = await initWebSerial();

        if (webSerialConnected) {

            // start streaming UJSONRPC
            streamUJSONRPC();

            await sleep(1000);

            triggerCurrentState();
            serviceActive = true;

            await sleep(2000); // wait for service to init
            
            // call funcAtInit if defined
            if ( funcAtInit !== undefined ) {
                funcAtInit();
            }
            return true;
        }
        else {
            return false;
        }
    }

    /** <h4> Get the callback function to execute after service is initialized. </h4>
     * <p> <em> This function needs to be executed before calling init() </em> </p>
     * @public
     * @param {function} callback Function to execute after initialization ( during init() )
     * @example
     * mySPIKE.executeAfterInit( function () {
     *     var portsInfo = await mySPIKE.getPortsInfo();
     * })
     */
    function executeAfterInit(callback) {
        // Assigns global variable funcAtInit a pointer to callback function
        funcAtInit = callback;
    }

    /** <h4> Get the callback function to execute after a print or error from SPIKE python program </h4>
     * @public
     * @param {function} callback 
     */
    function executeAfterPrint(callback) {
        funcAfterPrint = callback;
    }

    /** <h4> Get the callback function to execute after Service Dock encounters an error </h4>
     * 
     * @public 
     * @param {any} callback 
     */
    function executeAfterError(callback) {
        funcAfterError = callback;
    }

    
    /**
     * 
     * @public
     * @param {any} callback 
     */
    function executeWithStream(callback) {
        funcWithStream = callback;
    }

    /** <h4> Get the callback function to execute after service is disconnected </h4>
     * 
     * @public
     * @param {any} callback 
     */
    function executeAfterDisconnect(callback) {
        funcAfterDisconnect = callback;
    }

    function CodingRooms_executeAfterDisconnect(callback) {
        funcAfterDisconnectCodingRooms = callback;
    }

    /** <h4> Send command to the SPIKE Prime (UJSON RPC or Micropy depending on current interpreter) </h4>
     * <p> May make the SPIKE Prime do something </p>
     * @public 
     * @param {string} command Command to send (or sequence of commands, separated by new lines)
     */
    async function sendDATA(command) {
        // look up the command to send
        commands = command.split("\n"); // split on new line
        //commands = command
        console.log("%cTuftsCEEO ", "color: #3ba336;" , "sendDATA: " + commands);

        // make sure ready to write to device
        setupWriter();

        // send it in micropy if micropy reached
        if (micropython_interpreter) {
            
            for (var i = 0; i < commands.length; i++) {
                // console.log("commands.length", commands.length)

                // trim trailing, leading whitespaces
                var current = commands[i].trim();

                writer.write(current);
                writer.write(RETURN); // extra return at the end
            }
        }
        // expect json scripts if micropy not reached
        else {
            // go through each line of the command
            // trim it, send it, and send a return...
            for (var i = 0; i < commands.length; i++) {
                
                //console.log("%cTuftsCEEO ", "color: #3ba336;" ,"commands.length", commands.length)
                
                current = commands[i].trim();
                //console.log("%cTuftsCEEO ", "color: #3ba336;" ,"current", current);
                // turn string into JSON

                //string_current = (JSON.stringify(current));
                //myobj = JSON.parse(string_current);
                var myobj = await JSON.parse(current);

                // turn JSON back into string and write it out
                writer.write(JSON.stringify(myobj));
                writer.write(RETURN); // extra return at the end
            }
        }
    }


    /** <h4> Send character sequences to reboot SPIKE Prime </h4>
     * <p> <em> Run this function to exit micropython interpreter </em> </p>
     * @public
     * @example
     * mySPIKE.rebootHub();
     */
    async function rebootHub() {
        console.log("%cTuftsCEEO ", "color: #3ba336;" , "rebooting")
        // make sure ready to write to device
        setupWriter();
        await writer.write(CONTROL_C);
        await writer.write(CONTROL_D);

        //toggle micropython_interpreter flag if its was active
        if (micropython_interpreter) {
            micropython_interpreter = false;
        }
    }

    /** <h4> Get the information of all the ports and devices connected to them </h4>
     * @public
     * @returns {object} <p> An object with keys as port letters and values as objects of device type and info </p>
     * @example
     * // USAGE 
     * 
     * var portsInfo = await mySPIKE.getPortsInfo();
     * // ports.{yourPortLetter}.device --returns--> device type (ex. "smallMotor" or "ultrasonic") </p>
     * // ports.{yourPortLetter}.data --returns--> device info (ex. {"speed": 0, "angle":0, "uAngle": 0, "power":0} ) </p>
     * 
     * // Motor on port A
     * var motorSpeed = portsInfo["A"]["speed"]; // motor speed
     * var motorDegreesCounted = portsInfo["A"]["angle"]; // motor angle
     * var motorPosition = portsInfo["A"]["uAngle"]; // motor angle in unit circle ( -180 ~ 180 )
     * var motorPower = portsInfo["A"]["power"]; // motor power
     * 
     * // Ultrasonic Sensor on port A
     * var distance = portsInfo["A"]["distance"] // distance value from ultrasonic sensor
     * 
     * // Color Sensor on port A
     * var reflectedLight = portsInfo["A"]["reflected"]; // reflected light
     * var ambientLight = portsInfo["A"]["ambient"]; // ambient light
     * var RGB = portsInfo["A"]["RGB"]; // [R, G, B]
     * 
     * // Force Sensor on port A
     * var forceNewtons = portsInfo["A"]["force"]; // Force in Newtons ( 1 ~ 10 ) 
     * var pressedBool = portsInfo["A"]["pressed"] // whether pressed or not ( true or false )
     * var forceSensitive = portsInfo["A"]["forceSensitive"] // More sensitive force output( 0 ~ 900 )
     */
    async function getPortsInfo() {
        return ports;
    }

    /** <h4> get the info of a single port </h4>
     * @public
     * @param {string} letter Port on the SPIKE hub
     * @returns {object} Keys as device and info as value
     */
    async function getPortInfo(letter) {
        return ports[letter];
    }

    /** <h4> Get battery status </h4>
     * 
     * @public
     * @returns {integer} battery percentage
     */
    async function getBatteryStatus() {
        return batteryAmount;
    }

    /** <h4> Get info of the hub </h4>
     * @public
     * @returns {object} Info of the hub
     * @example
     * var hubInfo = await mySPIKE.getHubInfo();
     * 
     * var upDownDetector = hubInfo["gyro"][0];
     * var rightSideLeftSideDetector = hubInfo["gyro"][1];
     * var frontBackDetector = hubInfo["gyro"][2];
     * 
     * var rollAcceleration = hubInfo["pos"][0];  
     * var pitchAcceleration = hubInfo["pos"][1]; 
     * var yawAcceleration = hubInfo["pos"][2];   
     * 
     * var yawAngle = hubInfo["pos"][0];
     * var pitchAngle = hubInfo["pos"][1];
     * var rollAngle = hubInfo["pos"][2];
     * 
     */
    async function getHubInfo() {
        return hub;
    }

    /**
     * 
     * @returns name of hub
     */
    async function getHubName() {
        return hubName;
    }

    /**
     * 
     * @param {any} callback 
     */
    async function getFirmwareInfo(callback) {

        UJSONRPC.getFirmwareInfo(callback);

    }

    /**
     * 
     * @param {any} callback 
     */
    async function triggerCurrentState(callback) {

        UJSONRPC.triggerCurrentState(callback);
    }


    /** <h4> get projects in all the slots of SPIKE Prime hub </h4>
     * 
     * @public
     * @returns {object}
     */
    async function getProjects() {
        
        UJSONRPC.getStorageStatus();

        await sleep(2000);

        return hubProjects
    }

    /** <h4> Reach the micropython interpreter beneath UJSON RPC </h4>
     * <p> Note: Stops UJSON RPC stream </p>
     * <p> hub needs to be rebooted to return to UJSONRPC stream</p>
     * @public
     * @example
     * mySPIKE.reachMicroPy();
     * mySPIKE.sendDATA("from spike import PrimeHub");
     * mySPIKE.sendDATA("hub = PrimeHub()");
     * mySPIKE.sendDATA("hub.light_matrix.show_image('HAPPY')");
     */
    async function reachMicroPy() {
        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"starting micropy interpreter");
        setupWriter();
        writer.write(CONTROL_C);
        micropython_interpreter = true;
    }

    /** <h4> Get the latest complete line of UJSON RPC from stream </h4>
     * @public
     * @returns {string} Represents a JSON object from UJSON RPC
     */
    async function getLatestUJSON() {

        try {
            var parsedUJSON = await JSON.parse(lastUJSONRPC)
        }
        catch (error) {
            //console.log("%cTuftsCEEO ", "color: #3ba336;" ,'[retrieveData] ERROR', error);
        }

        return lastUJSONRPC
    }

    /** Get whether the Service was initialized or not
     * @public
     * @returns {boolean} True if service initialized, false otherwise
     */
    function isActive() {
        return serviceActive;
    }

    /** <h4> Get the most recently detected orientation of the hub </h4>
     * @public
     * @returns {string} ['up','down','front','back','leftside','rightside']
     */
    async function getHubOrientation() {
        return lastHubOrientation;
    }

    /** <h4> Get the most recently detected event on the display of the hub </h4>
     * @public
     * @returns {string} ['tapped','doubletapped']
     */
    async function getHubFrontEvent() {
        return hubFrontEvent;
    }

    /** <h4> Get the most recently detected gesture of the hub </h4>
     * @public
     * @returns {string} ['shake', 'freefall']
     */
    async function getHubGesture() {
        return hubGesture;
    }

    /** <h4> Get the latest press event information on the "connect" button </h4>
     * @public
     * @returns {object} { "pressed": BOOLEAN, "duration": NUMBER } 
     * @example
     * var bluetoothButtonInfo = await mySPIKE.getBluetoothButton();
     * var pressedBool = bluetoothButtonInfo["pressed"];
     * var pressedDuration = bluetoothButtonInfo["duration"]; // duration is miliseconds the button was pressed until release
     */
    async function getBluetoothButton() {
        return hubBluetoothButton;
    }

    /** <h4> Get the latest press event information on the "center" button </h4>
     * @public
     * @returns {object} { "pressed": BOOLEAN, "duration": NUMBER }
     * @example
     * var mainButtonInfo = await mySPIKE.getMainButton();
     * var pressedBool = mainButtonInfo["pressed"];
     * var pressedDuration = mainButtonInfo["duration"]; // duration is miliseconds the button was pressed until release
     * 
     */
    async function getMainButton() {
        return hubMainButton;
    }

    /** <h4> Get the latest press event information on the "left" button </h4>
     * @public
     * @returns {object} { "pressed": BOOLEAN, "duration": NUMBER } 
     * @example
     * var leftButtonInfo = await mySPIKE.getLeftButton();
     * var pressedBool = leftButtonInfo["pressed"];
     * var pressedDuration = leftButtonInfo["duration"]; // duration is miliseconds the button was pressed until release
     * 
     */
    async function getLeftButton() {
        return hubLeftButton;
    }

    /** <h4> Get the latest press event information on the "right" button </h4>
     * @public
     * @returns {object} { "pressed": BOOLEAN, "duration": NUMBER } 
     * @example
     * var rightButtonInfo = await mySPIKE.getRightButton();
     * var pressedBool = rightButtonInfo["pressed"];
     * var pressedDuration = rightButtonInfo["duration"]; // duration is miliseconds the button was pressed until release
     */
    async function getRightButton() {
        return hubRightButton;
    }

    async function getTotalUJSONRPCProcessed() {
        return totalUJSONRPCProcessed;
    }

    async function getTotalUJSONRPCPrimeHubEventHandled () {
        return totalUJSONRPCPrimeHubEventHandled;
    }

    async function getTotalUJSONRPCHubInfoUpdated () {
        return totalUJSONRPCHubInfoUpdated;
    }

    /** <h4> Get the ports connected to any kind of Motors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Motors
     */
    async function getMotorPorts() {

        var portsInfo = ports;
        var motorPorts = [];
        for (var key in portsInfo) {
            if (portsInfo[key].device == "smallMotor" || portsInfo[key].device == "bigMotor") {
                motorPorts.push(key);
            }
        }
        return motorPorts;

    }

    /** <h4> Get the ports connected to Small Motors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Small Motors
     */
    async function getSmallMotorPorts() {
        
        var portsInfo = ports;
        var motorPorts = [];
        for (var key in portsInfo) {
            if (portsInfo[key].device == "smallMotor" ) {
                motorPorts.push(key);
            }
        }
        return motorPorts;

    }

    /** <h4> Get the ports connected to Big Motors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Big Motors
     */
    async function getBigMotorPorts() {
        var portsInfo = ports;
        var motorPorts = [];
        for (var key in portsInfo) {
            if (portsInfo[key].device == "bigMotor") {
                motorPorts.push(key);
            }
        }
        return motorPorts;
    }

    /** <h4> Get the ports connected to Distance Sensors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Distance Sensors
     */
    async function getUltrasonicPorts() {

        var portsInfo = await this.getPortsInfo();
        var ultrasonicPorts = [];

        for (var key in portsInfo) {
            if (portsInfo[key].device == "ultrasonic") {
                ultrasonicPorts.push(key);
            }
        }

        return ultrasonicPorts;

    }

    /** <h4> Get the ports connected to Color Sensors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Color Sensors
     */
    async function getColorPorts() {

        var portsInfo = await this.getPortsInfo();
        var colorPorts = [];

        for (var key in portsInfo) {
            if (portsInfo[key].device == "color") {
                colorPorts.push(key);
            }
        }

        return colorPorts;

    }

    /** <h4> Get the ports connected to Force Sensors </h4>
     * @public
     * @returns {(string|Array)} Ports that are connected to Force Sensors
     */
    async function getForcePorts() {

        var portsInfo = await this.getPortsInfo();
        var forcePorts = [];

        for (var key in portsInfo) {
            if (portsInfo[key].device == "force") {
                forcePorts.push(key);
            }
        }

        return forcePorts;

    }

    /** <h4> Terminate currently running micropy program</h4>
     * @public
     */
    function stopCurrentProgram() {
        UJSONRPC.programTerminate();
    }

    /** <h4> write a micropy program into a slot of the SPIKE Prime </h4>
     * 
     * @public
     * @param {string} projectName name of the project to register
     * @param {string} data the micropy code to send (expecting an <input type="text">.value)
     * @param {integer} slotid slot number to assign the program in [0-9]
     * @param {function} callback callback to run after program is written
     */
    async function writeProgram(projectName, data, slotid, callback) {

        // reinit witeProgramTimeout
        if (writeProgramSetTimeout != undefined) {
            clearTimeout(writeProgramSetTimeout);
            writeProgramSetTimeout = undefined;
        }

        // template of python file that needs to be concatenated
        var firstPart = "from runtime import VirtualMachine\n\n# Stack for execution:\nasync def stack_1(vm, stack):\n\n\n"
        var secondPart = "# Setup for execution:\ndef setup(rpc, system, stop):\n\n    # Initialize VM:\n    vm = VirtualMachine(rpc, system, stop, \"Target__1\")\n\n    # Register stack on VM:\n    vm.register_on_start(\"stack_1\", stack_1)\n\n    return vm"

        // stringify data and strip trailing and leading quotation marks
        var stringifiedData = JSON.stringify(data);
        stringifiedData = stringifiedData.substring(1, stringifiedData.length - 1);

        var result = ""; // string to which the final code will be appended

        var splitData = stringifiedData.split(/\\n/); // split the code by every newline

        // add a tab before every newline (this is syntactically needed for concatenating with the template)
        for (var index in splitData) {

            var addedTab = "    " + splitData[index] + "\n";

            result = result + addedTab;
        }

        // replace tab characters
        result = result.replace(/\\t/g, "    ");

        stringifiedData = firstPart + result + secondPart;

        writeProgramCallback = callback;

        // begin the write program process
        UJSONRPC.startWriteProgram(projectName, "python", stringifiedData, slotid);

    }

    /** <h4> Execute a program in a slot </h4>
     * 
     * @public
     * @param {integer} slotid slot of program to execute [0-9]
     */
    function executeProgram(slotid) {
        UJSONRPC.programExecute(slotid)
    }

    async function testStreamUJSONRPC(input) {
        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"starting test");

        var testsResults = [true];

        for (var test in input) {
            var testInput = input[test];

            for (var packetIndex in testInput) {
                await parsePacket(testInput[packetIndex], true, () => {
                    testsResults[test] = false;
                });
            }

        }

        // reset variables
        jsonline = "";
        lastUJSONRPC = undefined;
        json_string = undefined;
        cleanedJsonString = undefined;

        return testsResults;


    }

    //////////////////////////////////////////
    //                                      //
    //          UJSONRPC Functions          //
    //                                      //
    //////////////////////////////////////////

    /** Low Level UJSONRPC Commands
     * @namespace UJSONRPC
     */
    var UJSONRPC = {};

    /**
     * 
     * @memberof! UJSONRPC
     * @param {string} text 
     */
    UJSONRPC.displayText = async function displayText(text) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "scratch.display_text", "p": {"text":' + '"' + text + '"' + '} }'
        sendDATA(command);
    }

    /**
     * @memberof! UJSONRPC
     * @param {integer} x [0 to 4]
     * @param {integer} y [0 to 4]
     * @param {integer} brightness [1 to 100]
     */
    UJSONRPC.displaySetPixel = async function displaySetPixel(x, y, brightness) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "scratch.display_set_pixel", "p": {"x":' + x +
            ', "y":' + y + ', "brightness":' + brightness + '} }';
        sendDATA(command);
    }

    /**
     * @memberof! UJSONRPC
     */
    UJSONRPC.displayClear = async function displayClear() {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "scratch.display_clear" }';
        sendDATA(command);
    }

    /**
     * @memberof! UJSONRPC
     * @param {string} port 
     * @param {integer} speed 
     * @param {integer} stall 
     */
    UJSONRPC.motorStart = async function motorStart(port, speed, stall) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "scratch.motor_start", "p": {"port":'
            + '"' + port + '"' +
            ', "speed":' + speed +
            ', "stall":' + stall +
            '} }';
        sendDATA(command);
    }

    /** moves motor to a position
     * 
     * @memberof! UJSONRPC
     * @param {string} port 
     * @param {integer} position 
     * @param {integer} speed 
     * @param {boolean} stall 
     * @param {boolean} stop 
     * @param {function} callback
     */
    UJSONRPC.motorGoRelPos = async function motorGoRelPos(port, position, speed, stall, stop, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.motor_go_to_relative_position"' +
            ', "p": {' +
            '"port":' + '"' + port + '"' +
            ', "position":' + position +
            ', "speed":' + speed +
            ', "stall":' + stall +
            ', "stop":' + stop +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {string} port 
     * @param {integer} time 
     * @param {integer} speed 
     * @param {integer} stall 
     * @param {boolean} stop
     * @param {function} callback
     */
    UJSONRPC.motorRunTimed = async function motorRunTimed(port, time, speed, stall, stop, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.motor_run_timed"' +
            ', "p": {' +
            '"port":' + '"' + port + '"' +
            ', "time":' + time +
            ', "speed":' + speed +
            ', "stall":' + stall +
            ', "stop":' + stop +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {string} port 
     * @param {integer} degrees 
     * @param {integer} speed 
     * @param {integer} stall 
     * @param {boolean} stop
     * @param {function} callback
     */
    UJSONRPC.motorRunDegrees = async function motorRunDegrees(port, degrees, speed, stall, stop, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.motor_run_for_degrees"' +
            ', "p": {' +
            '"port":' + '"' + port + '"' +
            ', "degrees":' + degrees +
            ', "speed":' + speed +
            ', "stall":' + stall +
            ', "stop":' + stop +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * @memberof! UJSONRPC
     * @param {integer} time 
     * @param {integer} lspeed 
     * @param {integer} rspeed 
     * @param {string} lmotor 
     * @param {string} rmotor 
     * @param {boolean} stop
     * @param {function} callback
     */
    UJSONRPC.moveTankTime = async function moveTankTime(time, lspeed, rspeed, lmotor, rmotor, stop, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.move_tank_time"' +
            ', "p": {' +
            '"time":' + time +
            ', "lspeed":' + lspeed +
            ', "rspeed":' + rspeed +
            ', "lmotor":' + '"' + lmotor + '"' +
            ', "rmotor":' + '"' + rmotor + '"' +
            ', "stop":' + stop +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {integer} degrees 
     * @param {integer} lspeed 
     * @param {integer} rspeed 
     * @param {string} lmotor 
     * @param {string} rmotor 
     * @param {boolean} stop
     * @param {function} callback
     */
    UJSONRPC.moveTankDegrees = async function moveTankDegrees(degrees, lspeed, rspeed, lmotor, rmotor, stop, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.move_tank_degrees"' +
            ', "p": {' +
            '"degrees":' + degrees +
            ', "lspeed":' + lspeed +
            ', "rspeed":' + rspeed +
            ', "lmotor":' + '"' + lmotor + '"' +
            ', "rmotor":' + '"' + rmotor + '"' +
            ', "stop":' + stop +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {integer} lspeed 
     * @param {integer} rspeed 
     * @param {string} lmotor 
     * @param {string} rmotor 
     * @param {function} callback
     */
    UJSONRPC.moveTankSpeeds = async function moveTankSpeeds(lspeed, rspeed, lmotor, rmotor, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.move_start_speeds"' +
            ', "p": {' +
            '"lspeed":' + lspeed +
            ', "rspeed":' + rspeed +
            ', "lmotor":' + '"' + lmotor + '"' +
            ', "rmotor":' + '"' + rmotor + '"' +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {integer} lpower 
     * @param {integer} rpower 
     * @param {string} lmotor 
     * @param {string} rmotor 
     * @param {function} callback
     */
    UJSONRPC.moveTankPowers = async function moveTankPowers(lpower, rpower, lmotor, rmotor, callback) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.move_start_powers"' +
            ', "p": {' +
            '"lpower":' + lpower +
            ', "rpower":' + rpower +
            ', "lmotor":' + '"' + lmotor + '"' +
            ', "rmotor":' + '"' + rmotor + '"' +
            '} }';
        typeof callback !== undefined && pushResponseCallback(randomId, callback);
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {integer} volume 
     * @param {integer} note 
     */
    UJSONRPC.soundBeep = async function soundBeep(volume, note) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.sound_beep"' +
            ', "p": {' +
            '"volume":' + volume +
            ', "note":' + note +
            '} }';
        sendDATA(command);
    }

    /**
     * @memberof! UJSONRPC
     */
    UJSONRPC.soundStop = async function soundStop() {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "scratch.sound_off"' +
            '}';
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     * @param {string} port 
     * @param {integer} power 
     * @param {integer} stall 
     */
    UJSONRPC.motorPwm = async function motorPwm(port, power, stall) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "scratch.motor_pwm", "p": {"port":' + '"' + port + '"' +
            ', "power":' + power + ', "stall":' + stall + '} }';
        sendDATA(command);
    }

    /**
     * 
     * @memberof! UJSONRPC
     */
    UJSONRPC.getFirmwareInfo = async function getFirmwareInfo(callback) {
        var randomId = generateId();

        var command = '{"i":' + '"' + randomId + '"' + ', "m": "get_hub_info" ' + '}';
        sendDATA(command);
        if ( callback != undefined ) {
            getFirmwareInfoCallback = [randomId, callback];
        }
    }
    
    UJSONRPC.triggerCurrentState = async function triggerCurrentState(callback) {
        var randomId = generateId();

        var command = '{"i":' + '"' + randomId + '"' + ', "m": "trigger_current_state" ' + '}';
        sendDATA(command);
        if ( callback != undefined ) {
            triggerCurrentStateCallback = callback;
        }
    }

    /** 
     * 
     * 
     * @param {integer} slotid 
     */
    UJSONRPC.programExecute= async function programExecute(slotid) {
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' + ', "m": "program_execute", "p": {"slotid":' + slotid + '} }';
        sendDATA(command);
    }

    /** 
     * 
     * 
     */
    UJSONRPC.programTerminate = function programTerminate() {

        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "program_terminate"' +
            '}';

        sendDATA(command);
    }

    /**
     * 
     * @param {string} projectName name of the project
     * @param {integer} type type of data (micropy or scratch)
     * @param {string} data entire data to send in ASCII
     * @param {integer} slotid slot to which to assign the program
     */
    UJSONRPC.startWriteProgram = async function startWriteProgram(projectName, type, data, slotid) {

        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"in startWriteProgram...");
        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"constructing start_write_program script...");

        if (type == "python") {
            var typeInt = 0;
        }

        // construct the UJSONRPC packet to start writing program

        var dataSize = (new TextEncoder().encode(data)).length;
        
        var randomId = generateId();

        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "start_write_program", "p": {' +
            '"meta": {' +
            '"created": ' + parseInt(Date.now()) +
            ', "modified": ' + parseInt(Date.now()) +
            ', "name": ' + '"' + btoa(projectName) + '"' +
            ', "type": ' + typeInt +
            ', "project_id":' + Math.floor(Math.random() * 1000) +
            '}' +
            ', "fname": ' + '"' + projectName + '"' +
            ', "size": ' + dataSize +
            ', "slotid": ' + slotid +
            '} }';

        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"constructed start_write_program script...");
        
        // assign function to start sending packets after confirming blocksize and transferid
        startWriteProgramCallback = [randomId, writePackageFunc];

        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"sending start_write_program script");

        sendDATA(command);

        // check if start_write_program received a response after 5 seconds
        writeProgramSetTimeout = setTimeout(function() {
            if (startWriteProgramCallback != undefined) {
                if (funcAfterError != undefined) {
                    funcAfterError("5 seconds have passed without response... Please refresh the environment and try again.");
                }
            }
        }, 5000)

        // function to write the first packet of data
        function writePackageFunc(blocksize, transferid) {

            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"in writePackageFunc...");
            
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"stringified the entire data to send: ", data);
            
            // when data's length is less than the blocksize limit of sending data
            if ( data.length <= blocksize ) {
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"data's length is less than the blocksize of ", blocksize);

                // if the data's length is not zero (not empty)
                if ( data.length != 0 ) {

                    var dataToSend = data.substring(0, data.length); // get the entirety of data

                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"data's length is not zero, sending the entire data: ", dataToSend);

                    var base64data = btoa(dataToSend); // encode the packet to base64
                    
                    UJSONRPC.writePackage(base64data, transferid); // send the packet

                    // writeProgram's callback defined by the user
                    if (writeProgramCallback != undefined) {
                        writeProgramCallback();
                    }

                }
                // the package to send is empty, so throw error
                else {
                    throw new Error("package to send is initially empty");
                }

            }
            // if the length of data to send is larger than the blocksize, send only a blocksize amount
            // and save the remaining data to send packet by packet
            else if ( data.length > blocksize ) {

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"data's length is more than the blocksize of ", blocksize);

                var dataToSend = data.substring(0, blocksize); // get the first block of packet

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"sending the blocksize amount of data: ", dataToSend);

                var base64data = btoa(dataToSend); // encode the packet to base64

                var msgID = UJSONRPC.writePackage(base64data, transferid); // send the packet

                var remainingData = data.substring(blocksize, data.length); // remove the portion just sent from data

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"reassigning writePackageInformation with message ID: ", msgID);
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"reassigning writePackageInformation with remainingData: ", remainingData);

                // update package information to be used for sending remaining packets
                writePackageInformation = [msgID, remainingData, transferid, blocksize];

            }

        }        

    }



    /**
     * 
     * @param {string} base64data base64 encoded data to send
     * @param {string} transferid transferid of this program write process
     * @returns {string} the randomly generated message id used to send this UJSONRPC script
     */
    UJSONRPC.writePackage = function writePackage(base64data, transferid) {

        var randomId = generateId();
        var writePackageCommand = '{"i":' + '"' + randomId + '"' +
            ', "m": "write_package", "p": {' +
            '"data": ' + '"' + base64data + '"' +
            ', "transferid": ' + '"' + transferid + '"' +
            '} }';

        sendDATA(writePackageCommand);
    
        return randomId;

    }

    UJSONRPC.getStorageStatus = function getStorageStatus() {
        
        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "get_storage_status"' +
            '}';
        
        sendDATA(command);

    }

    UJSONRPC.removeProject = function removeProject(slotid) {

        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "remove_project", "p": {' +
            '"slotid": ' + slotid + 
            '} }';
        
        sendDATA(command);
    }

    UJSONRPC.moveProject = function moveProject(oldslotid, newslotid) {

        var randomId = generateId();
        var command = '{"i":' + '"' + randomId + '"' +
            ', "m": "move_project", "p": {' +
            '"old_slotid": ' + oldslotid +
            ', "new_slotid: ' + newslotid +
            '} }';

        sendDATA(command);

    }


    //////////////////////////////////////////
    //                                      //
    //          Private Functions           //
    //                                      //
    //////////////////////////////////////////

    /** 
     * 
     * @private
     * @param {any} id 
     * @param {any} funcName 
     */
    function pushResponseCallback(id, funcName) {
        
        var toPush = []; // [ ujson string id, function pointer ]
        
        toPush.push(id);
        toPush.push(funcName);

        // responseCallbacks has elements in it
        if ( responseCallbacks.length > 0 ) {

            var emptyFound = false; // empty index was found flag

            // insert the pointer to the function where index is empty
            for ( var index in responseCallbacks ) {
                if ( responseCallbacks[index] == undefined) {
                    responseCallbacks[index] = toPush;
                    emptyFound = true;
                }
            }

            // if all indices were full, push to the back
            if (!emptyFound) {
                responseCallbacks.push(toPush);
            }
            
        }
        // responseCallbacks current has no elements in it
        else {
            responseCallbacks.push(toPush);
        }

    }
    /** <h4> Sleep function </h4>
     * @private
     * @param {number} ms Miliseconds to sleep
     * @returns {Promise} 
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** <h4> generate random id for UJSONRPC messages </h4>
     * 
     * @returns {string}
     */
    function generateId() {
        var generatedID = ""
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for ( var i = 0; i < 4; i++ ) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            generatedID = generatedID + characters[randomIndex];
        }

        return generatedID;
    }

    /** <h4> Prompt user to select web serial port and make connection to SPIKE Prime </h4>
     * <p> Effect Makes prompt in Google Chrome ( Google Chrome Browser needs "Experimental Web Interface" enabled) </p>
     * <p> Note: </p>
     * <p> This function is to be executed before reading in JSON RPC streams from the hub </p>
     * <p> This function needs to be called when system is handling a user gesture (like button click) </p>
     * @private
     * @returns {boolean} True if web serial initialization is successful, false otherwise
     */
    async function initWebSerial() {
        try {
            var success = false;

            port = await navigator.serial.getPorts();
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"ports:", port);
            // select device
            port = await navigator.serial.requestPort({
                // filters:[filter]
            });

            // wait for the port to open.
            try {
                await port.open({ baudRate: 115200 });

            }
            catch (er) {
                console.log("%cTuftsCEEO ", "color: #3ba336;", er)
                if ( funcAfterError != undefined ) {
                    funcAfterError(er + "\nPlease try again. If error persists, refresh this environment.");
                }
                await port.close();
            }

            if (port.readable) {
                success = true;
            }
            else {
                success = false;
            }

            return success;


        } catch (e) {
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"Cannot read port:", e);
            if ( funcAfterError != undefined ) {
                funcAfterError(e);
            }
            return false;
        }
    }

    /** <h4> Initialize writer object before sending commands </h4>
     * @private
     * 
     */
    function setupWriter() {
        // if writer not yet defined:
        if (typeof writer === 'undefined') {
            // set up writer for the first time
            const encoder = new TextEncoderStream();
            writableStreamClosed = encoder.readable.pipeTo(port.writable);
            writer = encoder.writable.getWriter();
        }
    }

    function cleanJsonString(json_string) {
        var cleanedJsonString = "";
        json_string = json_string.trim();

        let findEscapedQuotes = /\\"/g;

        cleanedJsonString = json_string.replace(findEscapedQuotes, '"');
        cleanedJsonString = cleanedJsonString.substring(1, cleanedJsonString.length - 1);
        // cleanedJsonString = cleanedJsonString.replace(findNewLines,'');
        
        return cleanedJsonString;
    }

    async function processFullUJSONRPC(lastUJSONRPC, json_string = "undefined", testing = false, callback) {
        try {

            var parseTest = await JSON.parse(lastUJSONRPC)

            if (testing) {
                console.log("%cTuftsCEEO ", "color: #3ba336;", "processing FullUJSONRPC line: ", lastUJSONRPC);
            }

            countProcessedUJSONRPC = countProcessedUJSONRPC + 1;

            // update hub information using lastUJSONRPC
            if( parseTest["m"] == 0 ) {
                updateHubPortsInfo();
            }
            PrimeHubEventHandler();

            if (funcWithStream) {
                await funcWithStream();
            }

        }
        catch (e) {
            // don't throw error when failure of processing UJSONRPC is due to micropython
            if (lastUJSONRPC.indexOf("Traceback") == -1 && lastUJSONRPC.indexOf(">>>") == -1 && json_string.indexOf("Traceback") == -1 && json_string.indexOf(">>>") == -1 )  {
                if (funcAfterError != undefined) {
                    funcAfterError("Fatal Error: Please close any other window or program that is connected to your SPIKE Prime");
                }
            }
            console.log(e);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "error parsing lastUJSONRPC: ", lastUJSONRPC);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "current jsonline: ", jsonline);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "current cleaned json_string: ", cleanedJsonString)
            console.log("%cTuftsCEEO ", "color: #3ba336;", "current json_string: ", json_string);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "current value: ", value);

            if (callback != undefined) {
                callback();
            }

        }
    }

    /** <h4> Process a packet in UJSONRPC </h4>
    * @private
    *
    */
    async function parsePacket(value, testing = false, callback) {
        if (testing) {
            //console.log(value);
        }

        // stringify the packet to look for carriage return
        var json_string = await JSON.stringify(value);
        
        if (testing) {
            console.log(json_string);
        }
        
        cleanedJsonString = await cleanJsonString(json_string); // remove whitespaces, enclosing quotes, etc.

        jsonline = jsonline + cleanedJsonString; // concatenate packet to data
        jsonline = jsonline.trim();

        // regex search for carriage return
        let pattern = /\\r/g;
        var carriageReIndex = jsonline.search(pattern);

        // there is at least one carriage return in this packet
        if (carriageReIndex > -1) {

            // the concatenated packets start with a left curly brace (start of JSON)
            if (jsonline[0] == "{") {

                lastUJSONRPC = jsonline.substring(0, carriageReIndex);

                // look for conjoined JSON packets: there's at least two carriage returns in jsonline
                if (jsonline.match(/\\r/g).length > 1) {

                    var conjoinedPacketsArray = jsonline.split(/\\r/); // array that split jsonline by \r

                    // last index only contains "" as it would be after \r
                    for (var i = 0; i < conjoinedPacketsArray.length; i++) {

                        // for every JSON object in array except last, perform data handling
                        if ( i < conjoinedPacketsArray.length - 1 ) {
                            if (testing) {
                                console.log("%cTuftsCEEO ", "color: #3ba336;", "split jsonline: ", conjoinedPacketsArray[i]);
                            }
                            lastUJSONRPC = conjoinedPacketsArray[i];

                            await processFullUJSONRPC(lastUJSONRPC, json_string, testing, callback);
                        }
                        else {
                            jsonline = conjoinedPacketsArray[i];
                            console.log("%cTuftsCEEO ", "color: #3ba336;", "jsonline after conjoined process: ", jsonline);
                        }

                    }
                }
                // there are no conjoined packets in this jsonline
                else {
                    lastUJSONRPC = jsonline.substring(0, carriageReIndex);

                    await processFullUJSONRPC(lastUJSONRPC, json_string, testing, callback);

                    jsonline = jsonline.substring(carriageReIndex + 2, jsonline.length);
                }

            }
            else {
                console.log("%cTuftsCEEO ", "color: #3ba336;" , "jsonline needs reset: ", jsonline);

                jsonline = jsonline.substring(carriageReIndex+2, jsonline.length);

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"jsonline was reset to:" + jsonline);
                
                if (jsonline.indexOf("get_storage_status") > -1) {
                    rebootHub();
                }
                // reset jsonline for next concatenation
                // jsonline = "";
            }
        }

    }

    /** <h4> Continuously take UJSON RPC input from SPIKE Prime </h4>
     * @private
     */
    async function streamUJSONRPC(testing = false) {
        try {
            var firstReading = true;
            // read when port is set up
            while (port.readable) {

                // initialize readers
                const decoder = new TextDecoderStream();
                const readableStreamClosed = port.readable.pipeTo(decoder.writable);
                reader = decoder.readable.getReader();

                // continuously get
                while (true) {
                    try {

                        if (firstReading) {
                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"##### READING FIRST UJSONRPC LINE ##### CHECKING VARIABLES");
                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"jsonline: ", jsonline);
                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"lastUJSONRPC: ", lastUJSONRPC);
                            firstReading = false;
                            setInterval(function () {
                                console.log("%cTuftsCEEO ", "color: #3ba336;", "UJSONRPC messages processed in the last 10 seconds: ", countProcessedUJSONRPC);
                                
                                totalUJSONRPCProcessed.push(countProcessedUJSONRPC);
                                countProcessedUJSONRPC = 0;
                            }, 10000)
                        }

                        // read UJSON RPC stream ( actual data in {value} )
                        ({ value, done } = await reader.read());
                        
                        // log value
                        if (micropython_interpreter) {
                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,value);
                        }

                        // console.log(value);

                        //concatenate UJSONRPC packets into complete JSON objects
                        if (value) {

                            await parsePacket(value, testing);

                        }
                        if (done) {
                            serviceActive = false;
                            // reader has been canceled.
                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"[readLoop] DONE", done);
                        }
                    }
                    // error handler
                    catch (error) {
                        console.log("%cTuftsCEEO ", "color: #3ba336;" ,'[readLoop] ERROR', error);

                        serviceActive = false;
                        
                        if (funcAfterDisconnect != undefined) {
                            funcAfterDisconnect();
                        }

                        if ( funcAfterDisconnectCodingRooms != undefined ) {
                            funcAfterDisconnectCodingRooms();
                        }

                        if ( funcAfterError != undefined ) {
                            funcAfterError("SPIKE Prime hub has been disconnected");
                        }

                        writer.close();
                        //await writer.releaseLock();
                        await writableStreamClosed;

                        reader.cancel();
                        //await reader.releaseLock();
                        await readableStreamClosed.catch(reason => { });

                        await port.close();

                        writer = undefined;
                        reader = undefined;
                        jsonline = "";
                        lastUJSONRPC = undefined;
                        json_string = undefined;
                        cleanedJsonString = undefined;

                        break; // stop trying to read
                    }
                } // end of: while (true) [reader loop]

                // release the lock
                reader.releaseLock();

            } // end of: while (port.readable) [checking if readable loop]
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"- port.readable is FALSE")
        } // end of: trying to open port
        catch (e) {
            serviceActive = false;
            // Permission to access a device was denied implicitly or explicitly by the user.
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,'ERROR trying to open:', e);
        }
    }

    var flagForUpdatePortsInfoCounter = true;

    /** Get the devices that are connected to each port on the SPIKE Prime
     * <p> Effect: </p>
     * <p> Modifies {ports} global variable </p>
     * <p> Modifies {hub} global variable </p>
     * @private
     */
    async function updateHubPortsInfo() {

        // if a complete ujson rpc line was read
        if (lastUJSONRPC) {
            var data_stream; //UJSON RPC info to be parsed

            //get a line from the latest JSON RPC stream and parse to devices info
            try {
                data_stream = await JSON.parse(lastUJSONRPC);
                data_stream = data_stream.p;
                if (flagForUpdatePortsInfoCounter) {
                    setInterval( async function() {
                        console.log("%cTuftsCEEO ", "color: #3ba336;", "updatePortsInfo: UJSONRPC messages count in last 10 seconds: ", countHubInfoUpdateUJSONRPC);
                        
                        totalUJSONRPCHubInfoUpdated.push(countHubInfoUpdateUJSONRPC);

                        countHubInfoUpdateUJSONRPC = 0;
                    }, 10000)
                    flagForUpdatePortsInfoCounter = false;
                }

                countHubInfoUpdateUJSONRPC = countHubInfoUpdateUJSONRPC + 1;
            }
            catch (e) {
                // don't throw error when failure to parse UJSONRPC was due to micropython mixing in
                if (lastUJSONRPC.indexOf("Traceback") == -1 && lastUJSONRPC.indexOf(">>>") == -1) {
                    if (funcAfterError != undefined) {
                        funcAfterError("Fatal Error: Please reboot the Hub and refresh this environment");
                    }
                }
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"error parsing lastUJSONRPC at updateHubPortsInfo", lastUJSONRPC);
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,typeof lastUJSONRPC);
                console.log("%cTuftsCEEO ", "color: #3ba336;" ,lastUJSONRPC.p);
            }

            var index_to_port = ["A", "B", "C", "D", "E", "F"]

            // iterate through each port and assign a device_type to {ports}
            for (var key = 0; key < 6; key++) {

                let device_value = { "device": "none", "data": {} }; // value to go in ports associated with the port letter keys

                try {
                    var letter = index_to_port[key]

                    // get SMALL MOTOR information
                    if (data_stream[key][0] == 48) {

                        // parse motor information
                        var Mspeed = await data_stream[key][1][0];
                        var Mangle = await data_stream[key][1][1];
                        var Muangle = await data_stream[key][1][2];
                        var Mpower = await data_stream[key][1][3];

                        // populate value object
                        device_value.device = "smallMotor";
                        device_value.data = { "speed": Mspeed, "angle": Mangle, "uAngle": Muangle, "power": Mpower };
                        ports[letter] = device_value;
                    }
                    // get BIG MOTOR information
                    else if (data_stream[key][0] == 49) {
                        // parse motor information
                        var Mspeed = await data_stream[key][1][0];
                        var Mangle = await data_stream[key][1][1];
                        var Muangle = await data_stream[key][1][2];
                        var Mpower = await data_stream[key][1][3];

                        // populate value object
                        device_value.device = "bigMotor";
                        device_value.data = { "speed": Mspeed, "angle": Mangle, "uAngle": Muangle, "power": Mpower };
                        ports[letter] = device_value;

                    }
                    // get ULTRASONIC sensor information
                    else if (data_stream[key][0] == 62) {

                        // parse ultrasonic sensor information
                        var Udist = await data_stream[key][1][0];

                        // populate value object
                        device_value.device = "ultrasonic";
                        device_value.data = { "distance": Udist };
                        ports[letter] = device_value;
                    }
                    // get FORCE sensor information
                    else if (data_stream[key][0] == 63) {

                        // parse force sensor information
                        var Famount = await data_stream[key][1][0];
                        var Fbinary = await data_stream[key][1][1];
                        var Fbigamount = await data_stream[key][1][2];
                        
                        // convert the binary output to boolean for "pressed" key
                        if ( Fbinary == 1 ) {
                            var Fboolean = true;
                        } else {
                            var Fboolean = false;
                        }
                        // execute callback from ForceSensor.wait_until_pressed() 
                        if (Fboolean) {
                            // execute call back from wait_until_pressed() if it is defined
                            funcAfterForceSensorPress !== undefined && funcAfterForceSensorPress();
                            
                            // destruct callback function
                            funcAfterForceSensorPress = undefined;

                            // indicate that the ForceSensor was pressed
                            ForceSensorWasPressed = true;
                        } 
                        // execute callback from ForceSensor.wait_until_released()
                        else {
                            // check if the Force Sensor was just released
                            if (ForceSensorWasPressed) {
                                ForceSensorWasPressed = false;
                                funcAfterForceSensorRelease !== undefined && funcAfterForceSensorRelease();
                                funcAfterForceSensorRelease = undefined;
                            }
                        }
                        
                        // populate value object
                        device_value.device = "force";
                        device_value.data = { "force": Famount, "pressed": Fboolean, "forceSensitive": Fbigamount }
                        ports[letter] = device_value;
                    }
                    // get COLOR sensor information
                    else if (data_stream[key][0] == 61) {

                        // parse color sensor information
                        var Creflected = await data_stream[key][1][0];
                        var CcolorID = await data_stream[key][1][1];
                        var Cr = await data_stream[key][1][2];
                        var Cg = await data_stream[key][1][3];
                        var Cb = await data_stream[key][1][4];
                        var rgb_array = [Cr, Cg, Cb];

                        var Ccolor = colorDictionary[CcolorID];
                        // populate value object
                        device_value.device = "color";
                        device_value.data = { "reflected": Creflected, "color": Ccolor, "RGB": rgb_array };
                        ports[letter] = device_value;
                    }
                    /// NOTHING is connected
                    else if (data_stream[key][0] == 0) {
                        // populate value object
                        device_value.device = "none";
                        device_value.data = {};
                        ports[letter] = device_value;
                    }

                    //parse hub information
                    var gyro_x = data_stream[6][0];
                    var gyro_y = data_stream[6][1];
                    var gyro_z = data_stream[6][2];
                    var gyro = [gyro_x, gyro_y, gyro_z]; 
                    hub["gyro"] = gyro;
                    
                    var newOri = setHubOrientation(gyro);
                    // see if currently detected orientation is different from the last detected orientation
                    if ( newOri !== lastHubOrientation ) {
                        lastHubOrientation = newOri;

                        typeof funcAfterNewOrientation == "function" && funcAfterNewOrientation(newOri);
                        funcAfterNewOrientation = undefined;
                    }

                    var accel_x = data_stream[7][0];
                    var accel_y = data_stream[7][1];
                    var accel_z = data_stream[7][2];
                    var accel = [accel_x, accel_y, accel_z];
                    hub["accel"] = accel;

                    var posi_x = data_stream[8][0];
                    var posi_y = data_stream[8][1];
                    var posi_z = data_stream[8][2];
                    var pos = [posi_x, posi_y, posi_z];
                    hub["pos"] = pos;

                } catch (e) { } //ignore errors
            }
        }
    }
    
    var flagPrimeHubEventHandlerCounter = true;
    /** <h4> Catch hub events in UJSONRPC </h4>
     * <p> Effect: </p>
     * <p> Logs in the console when some particular messages are caught </p>
     * <p> Assigns the hub events global variables </p>
     * @private
     */
    async function PrimeHubEventHandler() {

        var parsedUJSON = await JSON.parse(lastUJSONRPC);

        var messageType = parsedUJSON["m"];
        /*
        if ( messageType === undefined ) {
            console.log("%cTuftsCEEO ", "color: #3ba336;" , "messageType is undefined");
            console.log("%cTuftsCEEO ", "color: #3ba336;", "erroneous UJSONRPC: ", lastUJSONRPC);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "parsed erroneous UJSONRPC: ", parsedUJSON);
            console.log("%cTuftsCEEO ", "color: #3ba336;", "stringified erroneous UJSONRPC: ", await JSON.stringify(parsedUJSON));
        }*/

        
        if (flagPrimeHubEventHandlerCounter) {
            setInterval(async function () {
                //console.log("%cTuftsCEEO ", "color: #3ba336;", "PrimeHubEventHandler: UJSONRPC messages count in last 10 seconds: ", countPrimeHubEventHandlerUJSONRPC);
                
                totalUJSONRPCPrimeHubEventHandled.push(countPrimeHubEventHandlerUJSONRPC);

                countPrimeHubEventHandlerUJSONRPC = 0;

            }, 10000);
            flagPrimeHubEventHandlerCounter = false;
        }

        countPrimeHubEventHandlerUJSONRPC = countPrimeHubEventHandlerUJSONRPC + 1;
        

        //console.log(messageType);

        //catch runtime_error made at ujsonrpc level
        if (messageType == "runtime_error") {
            var decodedResponse = atob(parsedUJSON["p"][3]);

            decodedResponse = JSON.stringify(decodedResponse);

            console.log("%cTuftsCEEO ", "color: #3ba336;" ,decodedResponse);

            var splitData = decodedResponse.split(/\\n/); // split the code by every newline

            // execute function after print if defined (only print the last line of error message)
            if (funcAfterError != undefined) {
                var errorType = splitData[splitData.length-2];

                // error is a syntax error
                if (errorType.indexOf("SyntaxError") > -1) {
                    /* get the error line number*/
                    var lineNumberLine = splitData[splitData.length - 3];
                    // console.log("%cTuftsCEEO ", "color: #3ba336;" ,"lineNumberLine: ", lineNumberLine);
                    var indexLine = lineNumberLine.indexOf("line");
                    var lineNumberSubstring = lineNumberLine.substring(indexLine, lineNumberLine.length);
                    var numberPattern = /\d+/g;
                    var lineNumber = lineNumberSubstring.match(numberPattern)[0];
                    // console.log("%cTuftsCEEO ", "color: #3ba336;" ,lineNumberSubstring.match(numberPattern));
                    // console.log("%cTuftsCEEO ", "color: #3ba336;" ,"lineNumber:", lineNumber);
                    // console.log("%cTuftsCEEO ", "color: #3ba336;" ,"typeof lineNumber:", typeof lineNumber);
                    var lineNumberInNumber = parseInt(lineNumber) - 6;
                    // console.log("%cTuftsCEEO ", "color: #3ba336;" ,"typeof lineNumberInNumber:", typeof lineNumberInNumber);

                    // removed line number specification due to inaccuracy
                    // funcAfterError("line " + lineNumberInNumber + ": " + errorType);
                    funcAfterError(errorType);

                }
                else {
                    funcAfterError(errorType);
                }
            }
        }
        else if (messageType == 0) {

        }
        // storage information
        else if ( messageType == 1 ) {
            
            var storageInfo = parsedUJSON["p"]["slots"]; // get info of all the slots
            
            for ( var slotid in storageInfo ) {
                hubProjects[slotid] = storageInfo[slotid]; // reassign hubProjects global variable
            }

        }
        // battery status
        else if (messageType == 2) {
            batteryAmount = parsedUJSON["p"][1];
        }
        // give center button click, left, right (?)
        else if (messageType == 3) {
            console.log(lastUJSONRPC);
            if (parsedUJSON.p[0] == "center") {
                hubMainButton.pressed = true;

                if (parsedUJSON.p[1] > 0) {
                    hubMainButton.pressed = false;
                    hubMainButton.duration = parsedUJSON.p[1];
                }
            }
            else if (parsedUJSON.p[0] == "connect") {
                hubBluetoothButton.pressed = true;

                if (parsedUJSON.p[1] > 0) {
                    hubBluetoothButton.pressed = false;
                    hubBluetoothButton.duration = parsedUJSON.p[1];
                }
            }
            else if (parsedUJSON.p[0] == "left") {
                hubLeftButton.pressed = true;

                // execute callback for wait_until_pressed() if defined
                typeof funcAfterLeftButtonPress === "function" && funcAfterLeftButtonPress();
                funcAfterLeftButtonPress = undefined;

                if (parsedUJSON.p[1] > 0) {
                    hubLeftButton.pressed = false;
                    hubLeftButton.duration = parsedUJSON.p[1];

                    // execute callback for wait_until_released() if defined
                    typeof funcAfterLeftButtonRelease === "function" && funcAfterLeftButtonRelease();
                    funcAfterLeftButtonRelease = undefined;
                }

            }
            else if (parsedUJSON.p[0] == "right") {
                hubRightButton.pressed = true;

                // execute callback for wait_until_pressed() if defined
                typeof funcAfterRightButtonPress === "function" && funcAfterRightButtonPress();
                funcAfterRightButtonPress = undefined;

                if (parsedUJSON.p[1] > 0) {
                    hubRightButton.pressed = false;
                    hubRightButton.duration = parsedUJSON.p[1];

                    // execute callback for wait_until_released() if defined
                    typeof funcAfterRightButtonRelease === "function" && funcAfterRightButtonRelease();
                    funcAfterRightButtonRelease = undefined;
                }
            }

        }
        // gives orientation of the hub (leftside, up,..), tapping of hub, 
        else if (messageType == 4) {
            var isOrientationData = parsedUJSON.p == "up" || parsedUJSON.p == "down" || parsedUJSON.p == "back" || parsedUJSON.p == "front" || parsedUJSON.p == "leftSide" || parsedUJSON.p == "rightSide";
            var isGestureData = parsedUJSON.p == "freefall" || parsedUJSON.p == "shake" || parsedUJSON.p == "tapped" || parsedUJSON.p == "doubletapped"
            /* this data stream is about hub orientation */
            if (isOrientationData) {
                
                var newOrientation = parsedUJSON.p;
                
                if (newOrientation == "up") {
                    lastHubOrientation = "up";
                }
                else if (newOrientation == "down") {
                    lastHubOrientation = "down";
                }
                else if (newOrientation == "front") {
                    lastHubOrientation = "front";
                }
                else if (newOrientation == "back") {
                    lastHubOrientation = "back";
                }
                else if (newOrientation == "leftSide") {
                    lastHubOrientation = "leftSide";
                }
                else if (newOrientation == "rightSide") {
                    lastHubOrientation = "rightSide";
                }
            }
            /* this data stream is about hub gesture */
            else if (isGestureData) {
                
                var newGesture = parsedUJSON.p;
                
                if (newGesture == "freefall") {
                    hubGesture = "freefall";
                    hubGestures.push(newGesture);
                }
                else if (newGesture == "shake") {
                    hubGesture = "shake";
                    hubGestures.push("shaken"); // the string is different at higher level
                }
                else if (newGesture == "tapped") {
                    hubFrontEvent = "tapped";
                    hubGestures.push(newGesture);
                }
                else if (newGesture == "doubletapped") {
                    hubFrontEvent = "doubletapped";
                    hubGestures.push(newGesture);
                }

                // execute funcAfterNewGesture callback that was taken at wait_for_new_gesture()
                typeof funcAfterNewGesture === "function" && funcAfterNewGesture(newGesture);
                funcAfterNewGesture = undefined;

            }
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,lastUJSONRPC);
        }
        else if (messageType == 7) {
            if (funcAfterPrint != undefined) {
                funcAfterPrint(">>> Program started!");
            }
        }
        else if (messageType == 8) {
            if ( funcAfterPrint != undefined ) {
                funcAfterPrint(">>> Program finished!");
            }
        }
        else if ( messageType == 9 ) {
            console.log("%cTuftsCEEO ", "color: #3ba336;", "found hubName UJSONRPC: ", lastUJSONRPC);
            var encodedName = parsedUJSON["p"][0];
            var decodedName = atob(encodedName);
            hubName = decodedName;

            if ( triggerCurrentStateCallback != undefined ) {
                triggerCurrentStateCallback();
            }
        }
        else if (messageType == 11) {
            console.log("%cTuftsCEEO ", "color: #3ba336;" ,lastUJSONRPC);
        }
        else if (messageType == "userProgram.print") {
            var printedMessage = parsedUJSON["p"]["value"];
            var NLindex = printedMessage.search(/\\n/);
            printedMessage = await printedMessage.substring(0, NLindex);
            
            console.log("%cTuftsCEEO ", "color: #3ba336;" , "print in micropy: ", atob(printedMessage));

            // execute function after print if defined
            if (funcAfterPrint != undefined) {
                funcAfterPrint(atob(printedMessage));
            }
        }
        else {

            console.log("%cTuftsCEEO ", "color: #3ba336;", lastUJSONRPC);

            // general parameters check
            if (parsedUJSON["r"]) {
                if (parsedUJSON["r"]["slots"]) {
                    
                    var storageInfo = parsedUJSON["r"]["slots"]; // get info of all the slots

                    for (var slotid in storageInfo) {
                        hubProjects[slotid] = storageInfo[slotid]; // reassign hubProjects global variable
                    }

                }
            }
            
            // getFirmwareInfo callback check
            if ( getFirmwareInfoCallback != undefined ) {
                if ( getFirmwareInfoCallback[0] == parsedUJSON["i"] ) {
                    var version = parsedUJSON["r"]["runtime"]["version"];
                    var stringVersion = ""
                    for (var index in version ) {
                        if (index < version.length -1 ) {
                            stringVersion = stringVersion + version[index] + ".";
                        }
                        else {
                            stringVersion = stringVersion + version[index];
                        }
                    }
                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"firmware version: ", stringVersion);
                    getFirmwareInfoCallback[1](stringVersion);
                }
            }

            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"received response: ", lastUJSONRPC);

            // iterate over responseCallbacks global variable
            for ( var index in responseCallbacks ) {

                var currCallbackInfo = responseCallbacks[index];

                // check if the message id of UJSONRPC corresponds to that of a response callback
                if ( currCallbackInfo[0] == parsedUJSON["i"] ) {
                    
                    var response = "null";

                    if ( parsedUJSON["r"] == 0 ) {
                        response = "done";
                    }
                    else if ( parsedUJSON["r"] == 2 ) {
                        response = "stalled";
                    }

                    // execute callback with the response
                    currCallbackInfo[1](response);

                    // empty the index of which callback that was just executed
                    responseCallbacks[index] = undefined;
                }
            }
            
            // execute the callback function after sending start_write_program UJSONRPC
            if ( startWriteProgramCallback != undefined ) {

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"startWriteProgramCallback is defined. Looking for matching mesasage id...")

                // check if the message id of UJSONRPC corresponds to that of a response callback
                if (startWriteProgramCallback[0] == parsedUJSON["i"]) {

                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"matching message id detected with startWriteProgramCallback[0]: ", startWriteProgramCallback[0])
                    
                    // get the information for the packet sending
                    var blocksize = parsedUJSON["r"]["blocksize"]; // maximum size of each packet to be sent in bytes
                    var transferid = parsedUJSON["r"]["transferid"]; // id to use for transferring this program

                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"executing writePackageFunc expecting transferID of ", transferid);

                    // execute callback
                    await startWriteProgramCallback[1](blocksize, transferid);

                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"deallocating startWriteProgramCallback");

                    // deallocate callback
                    startWriteProgramCallback = undefined;
                }
                
            }

            // check if the program should write packages for a program
            if ( writePackageInformation != undefined ) {

                console.log("%cTuftsCEEO ", "color: #3ba336;" ,"writePackageInformation is defined. Looking for matching mesasage id...")

                // check if the message id of UJSONRPC corresponds to that of the first write_package script that was sent
                if (writePackageInformation[0] == parsedUJSON["i"]) {

                    console.log("%cTuftsCEEO ", "color: #3ba336;" ,"matching message id detected with writePackageInformation[0]: ", writePackageInformation[0]);

                    // get the information for the package sending process
                    var remainingData = writePackageInformation[1];
                    var transferID = writePackageInformation[2];
                    var blocksize = writePackageInformation[3];

                    // the size of the remaining data to send is less than or equal to blocksize
                    if ( remainingData.length <= blocksize ) {
                        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"remaining data's length is less than or equal to blocksize");

                        // the size of remaining data is not zero
                        if ( remainingData.length != 0 ) {

                            var dataToSend = remainingData.substring(0, remainingData.length);

                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"reminaing data's length is not zero, sending entire remaining data: ", dataToSend);
                            
                            var base64data = btoa(dataToSend);

                            UJSONRPC.writePackage(base64data, transferID);

                            console.log("%cTuftsCEEO ", "color: #3ba336;" ,"deallocating writePackageInforamtion")

                            if (writeProgramCallback != undefined) {
                                
                                writeProgramCallback();
                            }


                            writePackageInformation = undefined;
                        }
                    }
                    // the size of remaining data is more than the blocksize
                    else if ( remainingData.length > blocksize ) {

                        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"remaining data's length is more than blocksize");

                        var dataToSend = remainingData.substring(0, blocksize);
                        
                        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"sending blocksize amount of data: ", dataToSend)
                        
                        var base64data = btoa(dataToSend);

                        var messageid = UJSONRPC.writePackage(base64data, transferID);

                        console.log("%cTuftsCEEO ", "color: #3ba336;" ,"expected response with message id of ", messageid);

                        var remainingData = remainingData.substring(blocksize, remainingData.length);

                        writePackageInformation = [messageid, remainingData, transferID, blocksize];   
                    }
                }

            }

        }
    }

    /** Get the orientation of the hub based on gyroscope values
     * 
     * @private
     * @param {(number|Array)} gyro 
     */
    function setHubOrientation(gyro) {
        var newOrientation;
        if (gyro[0] < 500 && gyro[0] > -500) {
            if (gyro[1] < 500 && gyro[1] > -500) {

                if (gyro[2] > 500) {
                    newOrientation = "front";
                }
                else if (gyro[2] < -500) {
                    newOrientation = "back";
                }
            }
            else if (gyro[1] > 500) {
                newOrientation = "leftside";
            }
            else if (gyro[1] < -500) {
                newOrientation = "rightside";
            }
        } else if (gyro[0] > 500) {
            newOrientation = "down";
        }
        else if (gyro[0] < -500) {
            newOrientation = "up";
        }

        return newOrientation;
    }

    // public members
    return {
        init: init,
        sendDATA: sendDATA,
        rebootHub: rebootHub,
        reachMicroPy: reachMicroPy,
        executeAfterInit: executeAfterInit,
        executeAfterPrint: executeAfterPrint,
        executeAfterError: executeAfterError,
        executeAfterDisconnect: executeAfterDisconnect,
        CodingRooms_executeAfterDisconnect: CodingRooms_executeAfterDisconnect,
        executeWithStream: executeWithStream,
        getPortsInfo: getPortsInfo,
        getPortInfo: getPortInfo,
        getBatteryStatus: getBatteryStatus,
        getFirmwareInfo: getFirmwareInfo,
        triggerCurrentState: triggerCurrentState,
        getHubInfo: getHubInfo,
        getHubName: getHubName,
        getProjects: getProjects,
        isActive: isActive,
        getBigMotorPorts: getBigMotorPorts,
        getSmallMotorPorts: getSmallMotorPorts,
        getUltrasonicPorts: getUltrasonicPorts,
        getColorPorts: getColorPorts,
        getForcePorts: getForcePorts,
        getMotorPorts: getMotorPorts,
        getLatestUJSON: getLatestUJSON,
        getBluetoothButton: getBluetoothButton,
        getMainButton: getMainButton,
        getLeftButton: getLeftButton,
        getRightButton: getRightButton,
        getHubGesture: getHubGesture,
        getHubFrontEvent: getHubFrontEvent,
        getHubOrientation: getHubOrientation,
        writeProgram: writeProgram,
        stopCurrentProgram: stopCurrentProgram,
        executeProgram: executeProgram,
        testStreamUJSONRPC: testStreamUJSONRPC,
        getTotalUJSONRPCHubInfoUpdated: getTotalUJSONRPCHubInfoUpdated,
        getTotalUJSONRPCPrimeHubEventHandled: getTotalUJSONRPCPrimeHubEventHandled,
        getTotalUJSONRPCProcessed: getTotalUJSONRPCProcessed
    };
}