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
	// Default settings
	var defaults = {
		fieldName: '#file-uploader',
		chunkedSize: 1024 * 1024 * 1 * 1, // 1024 * 1024 * 1 == 1mb
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

	// Get File DOM Info
	var getFileInfo = function (event) {
		File = event.target.files[0]
	}

	// handle submint  
	let submitHandler = (event) => {
		event.preventDefault()
		if (!File)
			return
		startUpload();
	}
	let startUpload = (part = 0) => {
		// get Total Number of Pices
		let ChunkPice = Math.ceil(File.size / settings.chunkedSize, 1)
		let start = part * settings.chunkedSize
		let end = Math.min(((start + settings.chunkedSize)), File.size)
		let FilePice = File.slice(start, end)
		let formdata = new FormData()
		let Reader = new FileReader()

		formdata.append('fileInfo',
			JSON.stringify({
				name: File.name,
				type: File.type,
				total: ChunkPice,
				part: part
			})
		);

		settings.uploader.setEndPoint(settings.endPoint)

		Reader.addEventListener("load", function (event) { // Setting up base64 URL on image
			if ((part < ChunkPice)) {
				formdata.append('file', event.target.result)
				settings.uploader.Start(formdata).then(
					() => {
						part++
						startUpload(part)
					}
				).catch( (error) => {
					console.log(error);
				} )
			}
		}, false);

		Reader.readAsDataURL(FilePice);
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
		cache: 'no-cache',
		body: file // This is your file object
	})
		.then(response => response.json())
		.then(result => {
			console.log('Success:', result);
		})
	return data
}
fetchUpload.prototype.setEndPoint = function (url) {
	this.endPoint = url;
}

function UploadXHR() { }
UploadXHR.prototype.Start = async function (file) {
	xhr = new XMLHttpRequest();
	xhr.open('POST', this.endPoint, true);
	await xhr.send(file);
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
	endPoint: './upload.php',
});