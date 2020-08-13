//Test constants
const exp_about_res = {
    "requestCommand": "about",
    //"random": removing random from both objects since the values will not be equal
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "ReadyHidden",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "details": {
        "softwareVersion": "2.1.0.0",
        "apiVersion": "1.0",
        "documentation": "https://xpressflexseries2api.taylortechnologies.com",
        "deviceName": "XpressFlex",
        "deviceSeries": 2,
        "deviceSerialNo": "XF000001",
        "deviceFirmware": "0.14",
        "newFirmwareAvailable": false,
        "newFirmwareVersion": "",
        "exeName": "XPressFlexConnect.exe",
        "animationAvailable": true,
        "available": true
    },
    "results": {
        "available": false
    }
};
const exp_init_res = {
    "requestCommand": "initialize",
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "ReadyHidden",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "details": {
        "softwareVersion": "2.1.0.0",
        "apiVersion": "1.0",
        "documentation": "https://xpressflexseries2api.taylortechnologies.com",
        "deviceName": "XpressFlex",
        "deviceSeries": 2,
        "deviceSerialNo": "XF000001",
        "deviceFirmware": "0.14",
        "newFirmwareAvailable": false,
        "newFirmwareVersion": "",
        "exeName": "XPressFlexConnect.exe",
        "animationAvailable": true,
        "available": true
    },
    "results": {
        "available": false
    }
}
const exp_newtest_res = {
    "requestCommand": "newtest",
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "ReadyVisible",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "details": {
        "available": false
    },
    "results": {
        "available": false
    }
};
const exp_status_res = {
    "requestCommand": "status",
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "Analyzing",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "results": {
        "available": false
    },
    "details": {
        "available": false
    }
};
const exp_result_res = {
    "requestCommand": "status",
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "Results",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "results": {
        "errorCode": 0,
        "errorMsg": "",
        "strips": [],
        "data": [
            {
                "analyteId": "Fe",
                "analyteName": "Iron",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "Salt",
                "analyteName": "Salt",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "Bo",
                "analyteName": "Salt",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "Cu",
                "analyteName": "Copper",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "FC",
                "analyteName": "Free Chlorine",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "TC",
                "analyteName": "Total Chlorine",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "pH",
                "analyteName": "pH",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "TA",
                "analyteName": "Total Alkalinity",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "TH",
                "analyteName": "Total Hardness",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "CYA",
                "analyteName": "Cyanuric Acid",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            },
            {
                "analyteId": "PO4",
                "analyteName": "Phosphate",
                "value": 1,
                "valueStatus": "Exact",
                "decimals": 0,
                "valueAsString": "1.0",
                "units": "ppm",
                "errorMsg": ""
            }
        ],
        "available": true
    },
    "details": {
        "available": false
    }
};
const exp_cancel_res = {
    "requestCommand": "cancel",
    "requestErrorCode": 0,
    "requestErrorMsg": "",
    "deviceConnected": true,
    "systemMode": "ReadyHidden",
    "systemErrorCode": 0,
    "systemErrorMsg": "",
    "details": {
        "available": false
    },
    "results": {
        "available": false
    }
};
const exp_error_res = {};