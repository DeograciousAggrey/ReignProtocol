const Sentry = require("@sentry/react");
export function getBinaryFileData(fileObj) {
	Sentry.captureMessage("getBinaryFileData", "info");
	try {
		if (fileObj) {
			let read = new FileReader();
			read.readAsBinaryString(fileObj);
			return read;
		} else {
			Sentry.captureMessage("fileObj is not defined", "warning");
		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
}

export function getDataURLFromFile(fileObj) {
	Sentry.captureMessage("getDataURLFromFile", "info");
	try {
		if (fileObj) {
			let read = new FileReader();
			read.readAsDataURL(fileObj);
			return read;
		} else {
			Sentry.captureMessage("fileObj is not defined", "warning");
		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
}

export async function retrieveFileFromURL(url) {
	Sentry.captureMessage("retrieveFileFRomURL", "info");
	try {
		if (!url) {
			return;
		}

		const response = await fetch(url);
		if (response.status === 200) {
			let blob = await response.blob();
			let read = new FileReader();
			read.readAsBinaryString(blob);
			return read;
		}
	} catch (error) {
		Sentry.captureException(error);
	}
}
