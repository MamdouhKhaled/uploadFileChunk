(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.fileUploader = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';
	//
	// Variables
	//

	var PublicAPI = {}; // Object for public APIs
	var settings;
	var File;
	var Reader = '';
	// Default settings
	var defaults = {
		fieldName: '#file-uploader',
		chunkedSize: 1024 * 1024 * 10,
		uploader: new UploaderHandler(),
	};


	//
	// Methods
	//

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					// If deep merge and property is an object, merge properties
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(true, extended[prop], obj[prop]);
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for (; i < length; i++) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};
	/**
	 * Methods
	 */

	// Get File DOM
	var getFileInfo = function (event) {
		File = event.target.files[0]
	}

	let submitHandler = (event) => {
		event.preventDefault()
		if (!File)
			return
		Reader = new FileReader();
		startUpload();
	}
	let startUpload = async (part = 0) => {
		// get Total Number of Pices
		let ChunkPice = Math.ceil(File.size / settings.chunkedSize, settings.chunkedSize);
		let next = (part < ChunkPice) ? settings.chunkedSize * (part + 1) - 1 : File.size;

		settings.uploader.setEndPoint(settings.endPoint);
		let FilePice = File.slice(part * settings.chunkedSize, next);

		let formdata = new FormData();
		formdata.append('file', FilePice);
		formdata.append('fileInfo',
			JSON.stringify({
				name: File.name,
				type: File.type,
				uploadAt: new Date().getTime(),
				total: ChunkPice
			})
		);
		formdata.append('part', part);

		if ((part <= ChunkPice))
			Reader.addEventListener("load", function () { // Setting up base64 URL on image
				console.log('asdasdasd');
				settings.uploader.Start(formdata)
				part++
				startUpload(part)

			}, false);

		Reader.readAsDataURL(FilePice);
		// await settings.uploader.Start(formdata).then(
		// 	startUpload(part)
		// ).catch()
	}
	/**
	 * Initialize PublicAPI
	 * @public
	 * @param {Object} options User settings
	 */
	PublicAPI.init = function (options) {
		// Merge user options with defaults
		settings = extend(defaults, options || {});

		// Check if we Have End Point or not 
		if (settings.endPoint == '') {
			return;
		}


		//render
		// upload 
		// xhr
		// AXIOS
		// Fetch

		// Event listeners
		document.querySelector(settings.fieldName).addEventListener('change', getFileInfo, false)
		document.querySelector(settings.fieldName).parentElement.addEventListener('submit', submitHandler, false);
	};


	//
	// Public APIs
	//

	return PublicAPI;

});

/**
 * Upload App Using Fetch
 */
function fetchUpload() {
}
fetchUpload.prototype.Start = function (file) {
	let data = fetch(this.endPoint, { // Your POST endpoint
		method: 'POST',
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		body: file // This is your file object
	}).then(
		response => response.json() // if the response is a JSON object
	).catch(
		error => console.log(error) // Handle the error response object
	);
	return data;
}
fetchUpload.prototype.setEndPoint = function (url) {
	this.endPoint = url;
}

function UploadXHR() { }
UploadXHR.prototype.Start = function (file) {
	xhr = new XMLHttpRequest();
	xhr.open('POST', this.endPoint, true);
	xhr.send(file);
}
UploadXHR.prototype.setEndPoint = function (url) {
	this.endPoint = url;
}

function UploaderHandler(method = 'fetch') {
	if (method == "fetch") {
		return new fetchUpload();
	} else if (method == "xhr")
		return new UploadXHR()
}
fileUploader.init({
	endPoint: 'http://localhost/test/upload.php',
});