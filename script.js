/* =========================================
   SMARTFLOW
   TRAFFIC SIMULATION
========================================= */


/* =========================================
   DOM
========================================= */

const intersection =
    document.querySelector(".intersection");

const timerElement =
    document.getElementById("timer");

const currentSignalElement =
    document.getElementById("currentSignal");

const signalStatusElement =
    document.getElementById("signalStatus");

const vehiclesPassedElement =
    document.getElementById("vehiclesPassed");


/* =========================================
   COUNTERS
========================================= */

const countElements = {

    north:
        document.getElementById("northCount"),

    south:
        document.getElementById("southCount"),

    east:
        document.getElementById("eastCount"),

    west:
        document.getElementById("westCount")

};


/* =========================================
   LIGHTS
========================================= */

const lights = {

    north:
        document.querySelector(".light-top"),

    south:
        document.querySelector(".light-bottom"),

    west:
        document.querySelector(".light-left"),

    east:
        document.querySelector(".light-right")

};


/* =========================================
   SIGNAL STATE
========================================= */

let signalDirection = "NS";

let signalPhase = "GREEN";

let signalSeconds = 20;

let totalPassed = 0;


/* =========================================
   VEHICLE DATA
========================================= */

const queues = {

    north: [],

    south: [],

    east: [],

    west: []

};


const totalCreated = {

    north: 0,

    south: 0,

    east: 0,

    west: 0

};


/* =========================================
   VEHICLES
========================================= */

const vehicleTypes = [

    "🚗",
    "🚙",
    "🚕",
    "🏍️",
    "🚌"

];


/* =========================================
   SETTINGS
========================================= */

const VEHICLE_SPEED = 1.8;

const VEHICLE_GAP = 48;

const MAX_QUEUE = 7;


/*
   This is the distance between
   vehicle start and zebra crossing.

   It is calculated according to
   the actual intersection size.
*/


/* =========================================
   GET ROAD SIZE
========================================= */

function getRoadGeometry() {

    const width =
        intersection.clientWidth;

    const height =
        intersection.clientHeight;


    const centerX =
        width / 2;

    const centerY =
        height / 2;


    return {

        width,
        height,
        centerX,
        centerY,

        roadWidth: 220,

        vehicleSize: 38

    };

}


/* =========================================
   SET LIGHT
========================================= */

function setLight(light, color) {

    if (!light) {
        return;
    }


    const red =
        light.querySelector(".red");

    const yellow =
        light.querySelector(".yellow");

    const green =
        light.querySelector(".green");


    red.classList.remove("active");

    yellow.classList.remove("active");

    green.classList.remove("active");


    if (color === "red") {

        red.classList.add("active");

    }

    if (color === "yellow") {

        yellow.classList.add("active");

    }

    if (color === "green") {

        green.classList.add("active");

    }

}


/* =========================================
   NORTH / SOUTH GREEN
========================================= */

function setNorthSouthGreen() {

    setLight(
        lights.north,
        "green"
    );

    setLight(
        lights.south,
        "green"
    );

    setLight(
        lights.east,
        "red"
    );

    setLight(
        lights.west,
        "red"
    );


    currentSignalElement.innerText =
        "NORTH — SOUTH";

    signalStatusElement.innerText =
        "● GREEN";

    signalStatusElement.style.color =
        "#55e68a";

}


/* =========================================
   EAST / WEST GREEN
========================================= */

function setEastWestGreen() {

    setLight(
        lights.north,
        "red"
    );

    setLight(
        lights.south,
        "red"
    );

    setLight(
        lights.east,
        "green"
    );

    setLight(
        lights.west,
        "green"
    );


    currentSignalElement.innerText =
        "EAST — WEST";

    signalStatusElement.innerText =
        "● GREEN";

    signalStatusElement.style.color =
        "#55e68a";

}


/* =========================================
   YELLOW
========================================= */

function setYellow() {

    signalPhase = "YELLOW";

    signalSeconds = 3;


    if (signalDirection === "NS") {

        setLight(
            lights.north,
            "yellow"
        );

        setLight(
            lights.south,
            "yellow"
        );

        setLight(
            lights.east,
            "red"
        );

        setLight(
            lights.west,
            "red"
        );

    } else {

        setLight(
            lights.north,
            "red"
        );

        setLight(
            lights.south,
            "red"
        );

        setLight(
            lights.east,
            "yellow"
        );

        setLight(
            lights.west,
            "yellow"
        );

    }


    signalStatusElement.innerText =
        "● YELLOW";

    signalStatusElement.style.color =
        "#ffd43b";

}


/* =========================================
   START GREEN
========================================= */

function startGreen() {

    signalPhase = "GREEN";

    signalSeconds = 20;


    if (signalDirection === "NS") {

        setNorthSouthGreen();

    } else {

        setEastWestGreen();

    }

}


/* =========================================
   CHECK SIGNAL
========================================= */

function directionIsGreen(direction) {

    if (signalPhase !== "GREEN") {

        return false;

    }


    if (
        signalDirection === "NS" &&
        (
            direction === "north" ||
            direction === "south"
        )
    ) {

        return true;

    }


    if (
        signalDirection === "EW" &&
        (
            direction === "east" ||
            direction === "west"
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================
   CREATE VEHICLE
========================================= */

function createVehicle(direction) {

    if (
        queues[direction].length >=
        MAX_QUEUE
    ) {

        return;

    }


    const vehicle =
        document.createElement("div");


    vehicle.className =
        "vehicle";


    vehicle.innerText =
        vehicleTypes[
            Math.floor(
                Math.random() *
                vehicleTypes.length
            )
        ];


    /*
       Distance travelled
    */

    vehicle.distance = 0;


    /*
       Has this vehicle crossed
       the zebra crossing?
    */

    vehicle.crossedZebra = false;


    /*
       Add direction
    */

    vehicle.direction =
        direction;


    /*
       Add to queue
    */

    queues[direction].push(
        vehicle
    );


    intersection.appendChild(
        vehicle
    );


    totalCreated[direction]++;


    updateCounters();


    /*
       Start animation
    */

    requestAnimationFrame(() => {

        moveVehicle(vehicle);

    });

}


/* =========================================
   FIND VEHICLE IN FRONT
========================================= */

function getVehicleAhead(vehicle) {

    const direction =
        vehicle.direction;

    const queue =
        queues[direction];


    const index =
        queue.indexOf(vehicle);


    /*
       Queue is maintained in travel order.

       [front, second, third, fourth]

       So previous item is vehicle ahead.
    */

    if (index <= 0) {

        return null;

    }


    return queue[index - 1];

}


/* =========================================
   SAFE FOLLOW DISTANCE
========================================= */

function hasSafeGap(vehicle) {

    const front =
        getVehicleAhead(vehicle);


    if (!front) {

        return true;

    }


    const gap =
        front.distance -
        vehicle.distance;


    return gap >= VEHICLE_GAP;

}


/* =========================================
   ZEBRA DISTANCE
========================================= */

function getZebraStopDistance(direction) {

    const geometry =
        getRoadGeometry();


    const cx =
        geometry.centerX;

    const cy =
        geometry.centerY;


    /*
       Zebra is approximately
       145px away from center.
    */

    const zebraOffset = 145;


    /*
       Vehicle center adjustment
    */

    const halfVehicle = 19;


    if (direction === "north") {

        /*
           North → South

           Start above screen.
           Zebra is around
           centerY - 145.
        */

        return (
            cy -
            zebraOffset -
            halfVehicle +
            45
        );

    }


    if (direction === "south") {

        /*
           South → North
        */

        return (
            geometry.height -
            (
                cy +
                zebraOffset +
                halfVehicle
            ) -
            45
        );

    }


    if (direction === "west") {

        /*
           West → East
        */

        return (
            cx -
            zebraOffset -
            halfVehicle +
            45
        );

    }


    if (direction === "east") {

        /*
           East → West
        */

        return (
            geometry.width -
            (
                cx +
                zebraOffset +
                halfVehicle
            ) -
            45
        );

    }


    return 160;

}


/* =========================================
   VEHICLE CROSSED ZEBRA
========================================= */

function updateZebraStatus(vehicle) {

    const stopDistance =
        getZebraStopDistance(
            vehicle.direction
        );


    /*
       Once vehicle crosses zebra,
       this remains TRUE forever.
    */

    if (
        vehicle.distance >=
        stopDistance
    ) {

        vehicle.crossedZebra = true;

    }

}


/* =========================================
   CAN MOVE THROUGH SIGNAL
========================================= */

function signalAllowsVehicle(vehicle) {

    /*
       ==================================
       MOST IMPORTANT RULE
       ==================================

       Vehicle already crossed zebra.

       Signal changes to RED.

       Vehicle continues.
    */

    if (vehicle.crossedZebra) {

        return true;

    }


    /*
       Vehicle has NOT crossed zebra.

       It must obey signal.
    */

    return directionIsGreen(
        vehicle.direction
    );

}


/* =========================================
   POSITION VEHICLE
========================================= */

function updateVehiclePosition(vehicle) {

    const geometry =
        getRoadGeometry();


    const width =
        geometry.width;

    const height =
        geometry.height;

    const cx =
        geometry.centerX;

    const cy =
        geometry.centerY;


    const d =
        vehicle.distance;


    const direction =
        vehicle.direction;


    /*
       ==================================
       NORTH → SOUTH
       ==================================

       Indian left lane:
       right side of vertical road
    */

    if (direction === "north") {

        vehicle.style.left =
            `${cx + 45}px`;

        vehicle.style.top =
            `${-45 + d}px`;

        vehicle.style.transform =
            "none";

    }


    /*
       ==================================
       SOUTH → NORTH
       ==================================

       Indian left lane:
       left side of vertical road
    */

    if (direction === "south") {

        vehicle.style.left =
            `${cx - 78}px`;

        vehicle.style.top =
            `${height + 7 - d}px`;

        vehicle.style.transform =
            "rotate(180deg)";

    }


    /*
       ==================================
       WEST → EAST
       ==================================

       Indian left lane:
       top side of horizontal road
    */

    if (direction === "west") {

        vehicle.style.left =
            `${-45 + d}px`;

        vehicle.style.top =
            `${cy - 78}px`;

        vehicle.style.transform =
            "rotate(90deg)";

    }


    /*
       ==================================
       EAST → WEST
       ==================================

       Indian left lane:
       bottom side of horizontal road
    */

    if (direction === "east") {

        vehicle.style.left =
            `${width + 7 - d}px`;

        vehicle.style.top =
            `${cy + 45}px`;

        vehicle.style.transform =
            "rotate(-90deg)";

    }

}


/* =========================================
   VEHICLE EXIT DISTANCE
========================================= */

function getExitDistance(direction) {

    const geometry =
        getRoadGeometry();


    if (
        direction === "north" ||
        direction === "south"
    ) {

        return (
            geometry.height + 100
        );

    }


    return (
        geometry.width + 100
    );

}


/* =========================================
   MOVE VEHICLE
========================================= */

function moveVehicle(vehicle) {

    if (
        !vehicle ||
        !vehicle.isConnected
    ) {

        return;

    }


    /*
       Update zebra status
    */

    updateZebraStatus(vehicle);


    /*
       Check front vehicle
    */

    const front =
        getVehicleAhead(vehicle);


    let allowedToMove = true;


    /* =================================
       QUEUE CHECK
    ================================= */

    if (front) {

        const gap =
            front.distance -
            vehicle.distance;


        /*
           Don't touch front vehicle
        */

        if (gap < VEHICLE_GAP) {

            allowedToMove = false;

        }

    }


    /* =================================
       SIGNAL CHECK
    ================================= */

    if (
        !signalAllowsVehicle(vehicle)
    ) {

        allowedToMove = false;

    }


    /* =================================
       MOVE
    ================================= */

    if (allowedToMove) {

        vehicle.distance +=
            VEHICLE_SPEED;


        vehicle.classList.remove(
            "stopped"
        );

    } else {

        vehicle.classList.add(
            "stopped"
        );

    }


    /*
       Check zebra again after movement
    */

    updateZebraStatus(vehicle);


    /*
       Update screen position
    */

    updateVehiclePosition(
        vehicle
    );


    /* =================================
       EXIT
    ================================= */

    const exitDistance =
        getExitDistance(
            vehicle.direction
        );


    if (
        vehicle.distance >=
        exitDistance
    ) {

        removeVehicle(
            vehicle
        );

        return;

    }


    /*
       Continue animation
    */

    requestAnimationFrame(() => {

        moveVehicle(vehicle);

    });

}


/* =========================================
   REMOVE VEHICLE
========================================= */

function removeVehicle(vehicle) {

    const direction =
        vehicle.direction;


    const queue =
        queues[direction];


    const index =
        queue.indexOf(vehicle);


    if (index !== -1) {

        queue.splice(
            index,
            1
        );

    }


    totalPassed++;


    vehiclesPassedElement.innerText =
        totalPassed;


    vehicle.remove();

}


/* =========================================
   UPDATE COUNTERS
========================================= */

function updateCounters() {

    countElements.north.innerText =
        totalCreated.north;

    countElements.south.innerText =
        totalCreated.south;

    countElements.east.innerText =
        totalCreated.east;

    countElements.west.innerText =
        totalCreated.west;

}


/* =========================================
   RANDOM TRAFFIC
========================================= */

function generateTraffic() {

    const directions = [

        "north",
        "south",
        "east",
        "west"

    ];


    /*
       Random direction
    */

    const direction =
        directions[
            Math.floor(
                Math.random() *
                directions.length
            )
        ];


    createVehicle(
        direction
    );

}


/* =========================================
   SIGNAL TIMER
========================================= */

function updateSignalTimer() {

    signalSeconds--;


    timerElement.innerText =
        signalSeconds;


    /*
       GREEN → YELLOW
    */

    if (
        signalPhase === "GREEN" &&
        signalSeconds <= 3
    ) {

        setYellow();

        return;

    }


    /*
       YELLOW → OPPOSITE GREEN
    */

    if (
        signalPhase === "YELLOW" &&
        signalSeconds <= 0
    ) {

        if (
            signalDirection === "NS"
        ) {

            signalDirection =
                "EW";

        } else {

            signalDirection =
                "NS";

        }


        startGreen();

    }

}


/* =========================================
   INITIAL SIGNAL
========================================= */

startGreen();


/* =========================================
   SIGNAL TIMER
========================================= */

setInterval(() => {

    updateSignalTimer();

}, 1000);


/* =========================================
   TRAFFIC GENERATOR
========================================= */

setInterval(() => {

    generateTraffic();

}, 1600);


/* =========================================
   INITIAL TRAFFIC
========================================= */

setTimeout(() => {

    createVehicle("north");

}, 500);


setTimeout(() => {

    createVehicle("north");

}, 1100);


setTimeout(() => {

    createVehicle("north");

}, 1700);


setTimeout(() => {

    createVehicle("south");

}, 2300);


setTimeout(() => {

    createVehicle("south");

}, 2900);


setTimeout(() => {

    createVehicle("east");

}, 3500);


setTimeout(() => {

    createVehicle("east");

}, 4100);


setTimeout(() => {

    createVehicle("west");

}, 4700);


setTimeout(() => {

    createVehicle("west");

}, 5300);