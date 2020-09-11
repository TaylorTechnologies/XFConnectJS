/* xfConnect.js v001 */

/* usage 

	xfConnect.animationInClient = true |false;	 ( default false )

	xfConnect.apiPort = integer  1024 through 65535 (recommend above 60000 default 61264);

	xfConnect.statusPollIntervalMs = 0 auto polling off,  or 500 .. 2000 for automatic status requests after newtest (until error or results)

set event handlers
	xfConnect.onAbout = 	
	xfConnect.onError =  
	xfConnect.onInitialize = 
	xfConnect.onNewTest
	xfConnect.onResults = 
	xfConnect.onStatus =  

	xfConnect.onLogRequestURL=
	
	xfConnect.about();
	xfConnect.initialize();
	xfConnect.newtest();
	xfConnect.status();
	xfConnect.cancel();

	xfAbout()
	xfCancel()	
	xfInitialize()
	xfNewTest()
	xfNewWaterTest()
	xfStatus()
	

	stripsAndLots = '7Way=B1234&PO4=K3456'	


usage:



	response	 {
								command: xfCommand,
								mode: json.systemMode,
								details: json.details, 
								results: json.results,
								responseJson: atomicResponse.jsonOrText,
								xhr: atomicResponse.xhr
	
	error 		 {
								xfCommand,
								deviceConnected: true| false,
								errorType: "apiConnectionError| etc",
								errorCode: 999,
								errorMsg: "",
								responseJson: null,
								xhr: xhrObject
						}	

================================================

*/

/* systemMode:  NoDevice | ReadyHidden | ReadyVisible | PrepareToDip | Dipping |
		InsertingShuttle | Analyzing | Results | UpdatingFirmware | UnexpectedError */	
		


function xfAbout() {
	xfConnect.about()
		.then( 
			function( about_Response ) {
				xfConnect.doOnAbout( about_Response );
			}
		)
		.catch( 
			function(  error ) {		
				xfConnect.doOnError( error );
			}
		);
}

function xfCancel() {
	xfConnect.cancel()
		.then( 
			function( cancel_Response ) {
				xfConnect.doOnCancel( cancel_Response );
			}
		)
		.catch( 
			function(  error ) {		
				xfConnect.doOnError( error );
			}
		);
}


function xfInitialize() {
	xfConnect.initialize()
		.then( 
			function( initialize_Response ) {
				xfConnect.doOnInitialize( initialize_Response );
			}
		)
		.catch( 
			function(  error ) {		
				xfConnect.doOnError( error );
			}
		);
}

function xfNewTest() {
	xfConnect.newtest()
		.then( 
			function( newtest_Response ) {
				xfConnect.doOnNewTest( newtest_Response );
			}
		)
		.catch( 
			function(  error ) {		
				xfConnect.doOnError( error );
			}
		);
}

function xfNewWaterTest( stripLotParams ) {
	
	if ( xfConnect.statusPollIntervalMs < 500)
		xfConnect.statusPollIntervalMs = 1000;
		
	xfConnect.initialize()
		.then(
			function( initialize_Resolve_Response ) {
				/* ignore initialize_Response because if here, system is initialized and ready*/	
				return xfConnect.newtest( stripLotParams );
			}	
		)		
		.then(
			function( newtest_Resolve_Response ) {
				/* ignore newtest_Response, because if here, newtest started without errors */	
				return new Promise ( function ( resolve, reject ) {
					( function waitForResults() {
						
						xfConnect.status()
							.then(
								function ( status_Resolve_Response ) {
									if ( status_Resolve_Response.mode == 'Results') {
										return resolve(	 status_Resolve_Response );
									}
									else {
										/* call client defined event handles for intermediate status requests (if assigned)*/
										if ( xfConnect.onStatus != null) {
											/* call event handler for intermediate status requests */
											xfConnect.doOnStatus( status_Resolve_Response );
										}	
										setTimeout( waitForResults, 	xfConnect.statusPollIntervalMs );
									}
								}	
						).catch(
							function (error) {
								if (xfConnect.onError != null)
									xfConnect.onError(error);
							}
						);
						} ) ();				
					}
				);	
			}	
		)
		.then( 
			function( status_Response ) {
				/* code to handle status_Response.results here */
				if ( xfConnect.onResults != null )
					xfConnect.onResults( status_Response );
			}
		)	
		.catch(
			function(  error ) {
				if ( xfConnect.onError != null )
					xfConnect.onError( error );
			}
		);
 }
	
function xfStatus() {
	xfConnect.status()
		.then( 
			function( status_Response ) {
				xfConnect.doOnStatus( status_Response );
			}
		)
		.catch( 
			function(  error ) {		
				xfConnect.doOnError( error );
			}
		);
}	
	
function XFConnect() {
	/*private properties*/
	this.requestInProgress = false;
	this.timeoutInProgress = null;
	/*public properties*/
	this.animationInClient = false;
	this.apiPort = 61264;
	this.statusPollIntervalMs = 0; /* 0 - auto polling off, else 500 .. 2000 ms auto status polling after newtest*/
	/* private methods*/
	this.checkResponse = checkResponse;
	this.doOnAbout = doOnAbout;
	this.doOnCancel = doOnCancel;
	this.doOnError = doOnError;
	this.doOnInitialize = doOnInitialize;
	this.doOnLogRequestURL = doOnLogRequestURL;
	this.doOnNewTest = doOnNewTest;
	this.doOnStatus = doOnStatus;				
	this.getApiURL = getApiURL;
	this.sendXFRequest = sendXFRequest;
	/*public methods*/
	this.about = about;
	this.cancel = cancel;
	this.initialize = initialize;
	this.newtest = newtest;
	this.status = status;
	/*puplic events*/
	this.onAbout = null;
	this.onCancel = null;
	this.onError = null;
	this.onInitialize = null;
	this.onLogRequestURL = null;
	this.onNewTest = null;
	this.onResults = null;
	this.onStatus = null;

	/*
	implementation
	*/
	const
		cFields_shared = [ 'requestCommand','requestErrorCode','requestErrorMsg','deviceConnected',
			'systemMode','systemErrorCode','systemErrorMsg' ],
		cFields_about = [ 'details' ],
		cFields_about_details = [ 'softwareVersion','apiVersion','documentation','deviceName','deviceSeries',
			'deviceSerialNo','deviceFirmware','animationAvailable','newFirmwareAvailable','newFirmwareVersion',
			'exeName' ],
		cFields_status = [ 'results' ],
		cFields_status_results = [ 'errorCode','errorMsg','strips', 'data' ];
	/*XFConnect*/
	function getApiURL( apiCommand, params ) {
		var
			urlParams;
		/*-*/
		urlParams = ( typeof params == 'undefined' ) ? "" : params;
		urlParams = ( params == "" ) ? "" : '?' + params;
		return 'http://localhost:' + this.apiPort + '/xf2/v1/' + apiCommand + urlParams;
	}
	/*XFConnect*/			
	function checkResponse( command, atomicResponse, error ) {
		/*  
			command is:  about | cancel | initialize | newtest | status	
			atomicResponse	 is:  { data: jsonOrText, xhr: xhrObject }  
				data is EITHER JSON.parse(xhr.responseText) OR xhr.responseText if parse error,
				xhrObject in the underlying XMLHttpRequest() object
			error is:  { type: "", code: 0, msg: "" }	
		*/	
		var
			json,
			requestCommand,
			missingFields;
		/**/	
		function setError( type, code, msg ) {
			error.type = type;
			error.code = code;
			error.msg = msg;	
		}
		/**/	
		function allFieldsFound( fieldNames, json, missingFields ) {
			var
				notFound,
				i,
				fieldName;
			/*-*/
			notFound = '';	
			for( i = 0; i < fieldNames.length; i++ ) {
				fieldName = fieldNames[ i ];
				if ( ! json.hasOwnProperty( fieldName ) )
					notFound += fieldName + ',';	
			}
			missingFields.fieldNames = notFound;	
			return ( notFound == '' ); 
		}
		/*-checkResponse-*/
		missingFields = { fieldNames: '' };
		if ( typeof 	atomicResponse.data == 'string' )
			setError( 'apiResponseFormattingError', 800, 'Invalid json data received in response' )
		else {
			json = atomicResponse.data;
			/* atomicResponse.jsonOrText is valid JSON */	
			requestCommand = ( json.hasOwnProperty( 'requestCommand' ) ) ? json.requestCommand  :  'missing';
			if ( requestCommand == 'missing' )
				setError( 'apiResponseFormattingError',  999,  'Field "requestCommand" is missing from Response' )
			else
			if ( requestCommand != command )
				setError( 'apiResponseFormattingError',  999, 'Incorrect requestCommand in Response "' + requestCommand
					+ '". Should be "' + command + '".')
			else	
			if ( ! allFieldsFound( cFields_shared, json, missingFields ) )
				setError( 'apiResponseFormattingError', 999, 'Fields are missing from "' + command + '" Response: ' + missingFields.fieldNames )
			else
			if ( ! json.deviceConnected )
				setError( 'noDeviceError', 203, 'Device is not connected' )
			else {	
				/* device is connected, and all shared response fields have been found in the response */
				if ( json.requestErrorCode != 0 )
					setError(  'apiUsageError', json.requestErrorCode, json.requestErrorMsg )	
				else
				if ( json.systemErrorCode != 0 )
					setError( ' xfSystemError', json.systemErrorCode, json.systemErrorMsg )
				else {
					error.type = 'none';
					error.code = 0;
					error.msg = "";		
					switch ( requestCommand ) {
						case "about":
						case "initialize":
							if ( ! json.hasOwnProperty( 'details' )  )
								setError( 'apiResponseFormattingError',  999,  'Field "details" is missing from Response' )
							else
							if ( ! allFieldsFound( cFields_about_details, json.details, missingFields ) )
								setError( 'apiResponseFormattingError', 999, 'Fields for "details" missing from Response: ' + missingFields.fieldNames );
							break;
						case "cancel":
							//;
							break;
						case "newtest":
							//
							break;
						case "status":
							if ( json.systemMode == 'Results' ) {
								if ( ! json.hasOwnProperty( 'results' )  )
									setError( 'apiResponseFormattingError',  999,  'Field "results" is missing from Response' )
								else
								if ( ! allFieldsFound( cFields_status_results, json.results, missingFields ) )
									setError(  'apiResponseFormattingError', 999, 'Fields for "results" missing from Response: ' + missingFields.fieldNames );
							}		
							break;
						default:
							setError(  'apiResponseFormattingError', 999, 'invalid XpressFlex system command in Response: ' + requestCommand );
							break;
					}
				}
			}
		}
	}
	/*XFConnect*/				
	function about() {
		return this.sendXFRequest( 'about' );
	}
	/*XFConnect*/	
	function cancel() {
		return this.sendXFRequest( 'cancel' );
	}
	/*XFConnect*/	
	function doOnAbout( response ) {
		if ( this.onAbout != null ) {
			try {
				xfConnect.onAbout( response );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}
	}
	/*XFConnect*/		
	function doOnCancel( response ) {
		if ( this.onCancel != null ) {
			try {
				xfConnect.onCancel( response );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}	
	}
	/*XFConnect*/	
	function doOnError( error ) {
		if ( this.onError != null ) {
			try {
				xfConnect.onError( error );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}
	}
	/*XFConnect*/	
	function doOnInitialize( response ) {
		if ( this.onError != null ) {
			try {
				xfConnect.onInitialize( response );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}
	}
	/*XFConnect*/	
	function doOnLogRequestURL( command, url ) {
		if ( this.onLogRequestURL != null ) {
			try {
				xfConnect.onLogRequestURL( command, url );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}
	}
	
	/*XFConnect*/	
	function doOnNewTest( response ) {
		if ( this.onNewTest != null ) {
			try {
				xfConnect.onNewTest( response );
			}
			catch( ex ) {
				console.log( ex.message )
				
			}	
		}
	}
	/*XFConnect*/	
	function doOnStatus( response ) {
		try {
			if (response.systemMode == 'Results') {
				if ( this.onResults != null )
					xfConnect.onResults( response );
			}
			else {	
				if ( this.onStatus != null )
					xfConnect.onStatus( response );
			}		
		}
		catch( ex ) {
			console.log( ex.message )
		}	
	}
	/*XFConnect*/	
	function initialize() {
		return this.sendXFRequest( 'initialize' );
	}
	/*XFConnect*/	
	function newtest( params ) {
		return this.sendXFRequest( 'newtest', params );
	}
	/*XFConnect*/	
	function status() {
		return this.sendXFRequest( 'status' );
	}
	/*XFConnect*/	
	function sendXFRequest( xfCommand, xfParams ) {
		var
			self,
			urlParams,
			error,
			url,
			p,
		/*-*/
		self = this;
		error = { type: "", code: 0, msg: "" };
		urlParams = ( typeof xfParams == 'undefined' ) ? "" : xfParams;
		url = this.getApiURL( xfCommand, urlParams );
		this.doOnLogRequestURL( xfCommand, url );
		/**/
		p = new Promise( 
			function ( resolve, reject ) {

				atomic( url,  { responseType: 'json' } )
					.then(
					 
						function ( atomicResponse ) {
							/*
								atomicResponse	 is:  
									{ 	data: jsonOrText, 
										xhr: xhrObject
									 }  
									data is EITHER JSON.parse(xhr.responseText) OR xhr.responseText if parse error,
									xhrObject in the underlying XMLHttpRequest() object
							*/
							var
								json;
							/*-*/		
							try {
								self.checkResponse( xfCommand,  atomicResponse, error );
							}
							catch( ex ) {
								error.type = 'programmerError';
								error.code = 995;
								error.msg =  ex.fileName.split('\\').pop().split('/').pop() + ': line ' + ex.lineNumber + ':' + ex.message;
							}
							if ( error.code != 0 ) {
//console.log('atomicResponse ' + JSON.stringify(atomicResponse))
								reject(
									{	command: xfCommand, 
										errorType: error.type, 
										errorCode: error.code, 
										errorMsg: error.msg,
									 	responseJson: null, 
									 	xhr: atomicResponse.xhr 
									}
								);
								
							}
							else {
								json = atomicResponse.data;	
								switch ( xfCommand ) {
									case "about":
									case "initialize":
										json.details.available = true;
										json.results = { available: false };
										break;
									case "cancel":
									case "newtest":
											json.details = { available: false };
											json.results = { available: false };
										break;	
									case "status":
							
										if ( json.systemMode == 'Results' ) {
											json.details = { available: false };
											json.results.available = true;
										}
										else {
											json.results = { available: false };
											json.details = { available: false };
										}										
										break;	
								}/* end switch*/					
								resolve( 
									{	command: xfCommand,
										mode: json.systemMode,
										details: json.details, 
										results: json.results,
										responseJson: json,
										xhr: atomicResponse.xhr
									 }
								);

							}	
						}

					)
					.catch( 
	
						function ( atomicError ) {
//console.log(' catch atomicError ' + JSON.stringify(atomicError));						
							/* atomicError is 
								{
									status: request.status,
									statusText: request.statusText,
									responseText : request.responseText
									xhr: request  (for xhr.responseType xhr.status,xhr.responseURL)
								}	
							*/
							reject(
								{	xfCommand,
									deviceConnected: false,
									errorType: "apiConnectionError",
									errorCode: 901,
									errorMsg: "statuscode is " + atomicError.status,
									responseJson: atomicError.responseText,
									xhr: atomicError.xhr
								} 
							);  /* atomic code was changed in xfAtomic.js to have xhr in the reject object */
						}

					);
			} 
		);
		return p;
	}

}

var 
  xfConnect = new XFConnect();


/*- atomic.js is included in this file to facilitate a single javascript file without dependencies for Xpress Flex Connect */

/*!
 * atomicjs v4.4.1
 * A tiny, Promise-based vanilla JS Ajax/HTTP plugin with great browser support.
 * (c) 2020 Chris Ferdinandi
 * MIT License
 * https://github.com/cferdinandi/atomic
 
 23-Jun-2020 modified for error to return xhr (Taylor Technologies, Inc.)
 */

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], (function () {
			return factory(root);
		}));
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		window.atomic = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, (function (window) {

	'use strict';

	//
	// Variables
	//

	var settings;

	// Default settings
	var defaults = {
		method: 'GET',
		username: null,
		password: null,
		data: {},
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		},
		responseType: 'text',
		timeout: null,
		withCredentials: false
	};


	//
	// Methods
	//

	/**
	 * Feature test
	 * @return {Boolean} If true, required methods and APIs are supported
	 */
	var supports = function () {
		return 'XMLHttpRequest' in window && 'JSON' in window && 'Promise' in window;
	};

	/**
	 * Merge two or more objects together.
	 * @param   {Object}   objects  The objects to merge together
	 * @returns {Object}            Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};

		// Merge the object into the extended object
		var merge = function (obj) {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(extended[prop], obj[prop]);
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for (var i = 0; i < arguments.length; i++) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Parse text response into JSON
	 * @private
	 * @param  {String} req The response
	 * @return {Array}      A JSON Object of the responseText, plus the orginal response
	 */
	var parse = function (req) {
		var result;
		if (settings.responseType !== 'text' && settings.responseType !== '') {
			return {data: req.response, xhr: req};
		}
		try {
			result = JSON.parse(req.responseText);
		} catch (e) {
			result = req.responseText;
		}
	console.log( 'req.responseTest ' + req.responseType);		
		return {data: result, xhr: req};
	};

	/**
	 * Convert an object into a query string
	 * @link   https://blog.garstasio.com/you-dont-need-jquery/ajax/
	 * @param  {Object|Array|String} obj The object
	 * @return {String}                  The query string
	 */
	var param = function (obj) {

		// If already a string, or if a FormData object, return it as-is
		if (typeof (obj) === 'string' || Object.prototype.toString.call(obj) === '[object FormData]') return obj;

		// If the content-type is set to JSON, stringify the JSON object
		if (/application\/json/i.test(settings.headers['Content-type']) || Object.prototype.toString.call(obj) === '[object Array]') return JSON.stringify(obj);

		// Otherwise, convert object to a serialized string
		var encoded = [];
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
			}
		}
		return encoded.join('&');

	};

	/**
	 * Make an XHR request, returned as a Promise
	 * @param  {String} url The request URL
	 * @return {Promise}    The XHR request Promise
	 */
	var makeRequest = function (url) {

		// Create the XHR request
		var request = new XMLHttpRequest();

		// Setup the Promise
		var xhrPromise = new Promise(function (resolve, reject) {
			var
				bReadyStateLoadingFound = false;
			// Setup our listener to process compeleted requests
			request.onreadystatechange = function () {
//console.log(request.readyState);

				// Only run if the request is complete
				if ( request.readyState !== 4 ) {
					bReadyStateLoadingFound = (request.readyState == 3);	
					return;
				}
//console.log('state ' + request.readyState);
//console.log('status' + request.statusText);
//console.log(request.responseType);

				// Prevent timeout errors from being processed

				if ( ! request.status ) {
					if ( bReadyStateLoadingFound )	
						return;
				}	

				// Process the response
//console.log( 'request.status ' + request.status );

				if (request.status >= 200 && request.status < 300) {
					// If successful
//console.log('successful')					
					resolve(parse(request));
//console.log('parse ok '+ JSON.stringify(parse(request)))					
					
				} else {
					// If failed
					reject({
						status: request.status,
						statusText: request.statusText,
						responseText : ( request.hasOwnProperty('responseText')) ? request.responseText : '',
						xhr: request /* 23-Jun-2020 Taylor Technologies,Inc.*/
					});
				}

			};

			// Setup our HTTP request
			request.open(settings.method, url, true, settings.username, settings.password);
			request.responseType = settings.responseType;

			// Add headers
			for (var header in settings.headers) {
				if (settings.headers.hasOwnProperty(header)) {
					request.setRequestHeader(header, settings.headers[header]);
				}
			}

			// Set timeout
			if (settings.timeout) {
				request.timeout = settings.timeout;
				request.ontimeout = function (e) {
					reject({
						status: 408,
						statusText: 'Request timeout'
					});
				};
			}

			// Add withCredentials
			if (settings.withCredentials) {
				request.withCredentials = true;
			}

			// Send the request
			request.send(param(settings.data));

		});

		// Cancel the XHR request
		xhrPromise.cancel = function () {
			request.abort();
		};

		// Return the request as a Promise
		return xhrPromise;

	};

	/**
	 * Instatiate Atomic
	 * @param {String} url      The request URL
	 * @param {Object} options  A set of options for the request [optional]
	 */
	var Atomic = function (url, options) {

		// Check browser support
		if (!supports()) throw 'Atomic: This browser does not support the methods used in this plugin.';

		// Merge options into defaults
		settings = extend(defaults, options || {});

		// Make request
		return makeRequest(url);

	};


	//
	// Public Methods
	//

	return Atomic;

}));

/*end */