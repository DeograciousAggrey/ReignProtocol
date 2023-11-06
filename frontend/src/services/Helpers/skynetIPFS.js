import { SkynetClient, genKeyPairFromSeed } from "skynet-js";
import { captureException } from "@sentry/react";
const Sentry = require("@sentry/react");
let fileName = "file";

function progressEvent(progress, file, status) {
	const event = new CustomEvent("progressDetail", {
		detail: {
			progress: progress,
			file: file,
			status: status,
		},
	});

	document.dispatchEvent(event);
}

// Set an upload progress tracker.
export function onUploadProgress(progress, { loaded, total }) {
	console.info(`Progress ${Math.round(progress * 100)}%`);

	let progressValue = Math.round(progress * 100);

	// event fire
	if (fileName !== "savingOtherDataToSkynetDb")
		progressEvent(progressValue, fileName, "Uploading");
}

const client = new SkynetClient("https://web3portal.com", {
	onUploadProgress,
	skynetApiKey: process.env.REACT_APP_SKYNET_APIKEY,
});
const { privateKey, publicKey } = genKeyPairFromSeed(
	process.env.REACT_APP_SKYNET_SEED_PHRASE
);

export async function uploadFile(file) {
	Sentry.captureMessage("uploadFile", "info");
	if (file) {
		try {
			fileName = file.name;
			const { skylink } = await client.uploadFile(file);
			console.log(`Upload successful, skylink: ${skylink}`);
			progressEvent(100, fileName, "Uploaded");
			return skylink;
		} catch (error) {
			captureException(error);
		}
	} else {
		Sentry.captureMessage("file is not define", "warning");
	}
}

export async function openFileInNewTab(skylink) {
	Sentry.captureMessage("openFileInNewTab", "info");
	if (skylink) {
		try {
			await client.openFile(skylink);
		} catch (error) {
			captureException(error);
		}
	} else {
		Sentry.captureMessage("skylink", "warning");
	}
}

export async function getFileUrl(skylink) {
	Sentry.captureMessage("getFileUrl", "info");
	if (skylink) {
		try {
			return await client.getSkylinkUrl(skylink);
		} catch (error) {
			captureException(error);
		}
	} else {
		Sentry.captureMessage("skylink", "warning");
	}
}

export async function storeJSONData(dataKey, jsonData) {
	Sentry.captureMessage("storeJSONData", "info");
	if (dataKey && jsonData) {
		try {
			fileName = "savingOtherDataToSkynetDb";
			await client.db.setJSON(privateKey, dataKey, jsonData);
		} catch (error) {
			captureException(error);
		}
	} else {
		Sentry.captureMessage("dataKey && jsonData return false", "warning");
	}
}

export async function getJSONData(dataKey) {
	Sentry.captureMessage("getJSONData", "info");
	if (dataKey) {
		try {
			const { data } = await client.db.getJSON(publicKey, dataKey);
			return data;
		} catch (error) {
			captureException(error);
		}
	} else {
		Sentry.captureMessage("dataKey is not define", "warning");
	}
}
