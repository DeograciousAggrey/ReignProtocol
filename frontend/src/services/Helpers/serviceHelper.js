import axiosHttpService from "../axioscall";
const Sentry = require("@sentry/react");
import {
	dygnifySendMobileOTP,
	dygnifyValidateMobileOTP,
	dygnifyGetMobileDetails,
	dygnifyKycOCR,
} from "../ApiOptions/dygnifyAxiosOptions";



function sanitizePhoneNo(phone) {
	// Remove additional symbols from the phone number
	let sanitizedPhoneNo = phone.replace("+", "").replace("-", "");
	const parsedPhoneNo = sanitizedPhoneNo.split(" ");
	return { countryCode: parsedPhoneNo[0], phoneNo: parsedPhoneNo[1] };
}

export async function sendMobileOtp(phone) {
	Sentry.captureMessage("sendMobileOtp", "info");
	try {
		if (phone) {
			// Sanitize the phone number first and then send OTP
			let { countryCode, phoneNo } = sanitizePhoneNo(phone);
			let mobileOTPRes = await axiosHttpService(
				dygnifySendMobileOTP(countryCode, phoneNo)
			);
			if (mobileOTPRes.code === 200) {
				return { requestId: mobileOTPRes.res["request_id"], status: true };
			}
		}else{
			Sentry.captureMessage("phone is not defined", "warning");

		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
	return { status: false };
}

export async function checkMobileOtp(requestId, otp, phoneNo) {
	Sentry.captureMessage("checkMobileOtp", "info");
	try {
		if (otp && requestId) {
			let checkMobileOtpResp = await axiosHttpService(
				dygnifyValidateMobileOTP(requestId, otp, phoneNo)
			);
			if (
				checkMobileOtpResp.res["status-code"] === "101" &&
				checkMobileOtpResp.res.result.sim_details.otp_validated
			) {
				return { status: true };
			}
		}else{
			Sentry.captureMessage("otp && requestId returning false", "warning");
		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
	return { status: false };
}

export async function getMobileDetails(requestId, phoneNo, bearerToken) {
	Sentry.captureMessage("getMobileDetails", "info");

	try {
		if (requestId) {
			let mobileDetailsResp = await axiosHttpService(
				dygnifyGetMobileDetails(requestId, phoneNo, bearerToken)
			);
			if (mobileDetailsResp.res["status-code"] === "101") {
				return { status: true, mobileData: mobileDetailsResp.res };
			}
		}else{
			Sentry.captureMessage("requestId not defined", "warning");
		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
	return { status: false };
}

export async function getOCRFetch(file, bearerToken) {
	Sentry.captureMessage("getOCRFetch", "info");
	try {
		if (file) {
			let ocrFetchResp = await axiosHttpService(
				dygnifyKycOCR(file, bearerToken)
			);
			if (ocrFetchResp.code === 200) {
				return { status: true, data: ocrFetchResp.res };
			}
		}else{
			Sentry.captureMessage("file is not define", "warning");
		}
	} catch (error) {
		Sentry.captureException(error);
		console.log(error);
	}
	return { status: false };
}
