import React, { useEffect, useState } from "react";
import DocumentCard from "../../uiTools/Card/DocumentCard";
import { useNavigate, useLocation } from "react-router-dom";
import KYBModal from "./Components/Modal/KYB/KYBModal";
import { getUserWalletAddress } from "../../services/BackendConnectors/userConnectors/commonConnectors";
import Twitter from "../SVGIcons/Twitter";
import LinkedIn from "../SVGIcons/LinkedIn";
import Email from "../SVGIcons/Email";
import Website from "../SVGIcons/Website";
import Edits from "../SVGIcons/Edits";
import axiosHttpService from "../../services/axioscall";
import { kycOptions } from "../../services/KYC/blockpass";
import Loader from "../../uiTools/Loading/Loader";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import {
	getBorrowerJson,
	getBorrowerLogoURL,
} from "../../services/BackendConnectors/userConnectors/borrowerConnectors";
import { captureException } from "@sentry/react";

const BorrowerProfile = () => {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);

	const [selected, setSelected] = useState(null);

	const [borrowerJson, setborrowerJson] = useState();
	const [logoImgSrc, setLogoImgSrc] = useState();
	const [companyName, setCompanyName] = useState();
	const [companyRepName, setCompanyRepName] = useState();
	const [companyBio, setCompanyBio] = useState();
	const [website, setWebsite] = useState();
	const [email, setEmail] = useState();
	const [twitter, setTwitter] = useState();
	const [linkedin, setLinkedin] = useState();
	const location = useLocation();
	const [profileStatus, setProfileStatus] = useState(false);
	const [kycStatus, setKycStatus] = useState(false);
	const [hasKey, setHaskey] = useState();
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const brJson = location.state;

	useEffect(() => {
		loadBorrowerProfileData();
		if (brJson) {
			let imgUrl = getBorrowerLogoURL(
				brJson.companyLogoFile.businessLogoFileCID,
				brJson.companyLogoFile.businessLogoFileName
			);
			if (imgUrl) {
				setLogoImgSrc(imgUrl);
			}

			setHaskey(brJson ? "businessLicFile" in brJson : false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleForm = () => {
		setSelected(null);
	};

	const checkKyc = (refId) => {
		axiosHttpService(kycOptions(refId)).then((result) => {
			if (
				result.res.status === "success" &&
				result.res.data.status === "approved"
			) {
				setKycStatus(true);
			}
			if (result.res.status === "error") {
				setKycStatus(false);
			}
			console.log(result.res);
		});
	};

	const loadBlockpassWidget = (refId) => {
		const blockpass = new window.BlockpassKYCConnect(
			process.env.REACT_APP_CLIENT_ID,
			{
				refId: refId,
			}
		);

		blockpass.startKYCConnect();

		blockpass.on("KYCConnectSuccess", () => {
			//add code that will trigger when data have been sent.
		});
	};

	useEffect(() => {
		// make the call to get borrower specific cid to fetch the data
		// currently we'll mock the cid
		console.log("reached use Effect Borrower");
		getUserWalletAddress().then((res) => {
			if (res.success) {
				checkKyc(res.address);
				{
					!kycStatus && loadBlockpassWidget(res.address);
				}
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});

		const fetchData = async () => {
			getBorrowerJson()
				.then((dataReader) => {
					if (dataReader) {
						dataReader.onloadend = function () {
							let brJson = JSON.parse(dataReader.result);
							loadBorrowerData(brJson);
							setborrowerJson(brJson);
							setHaskey(brJson ? "businessLicFile" in brJson : false);
						};
					}
				})
				.catch((e) => {
					captureException(e);
				})
				.finally(() => {
					setLoading(false);
				});
		};

		if (!location.state) {
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadBorrowerProfileData = (profileData) => {
		let data;
		if (brJson) data = brJson;
		else data = profileData;
		if (data) {
			setProfileStatus(true);
		}
		if (data) {
			try {
				if (data.companyName) {
					setCompanyName(data.companyName);
				}
				if (data.companyRepName) {
					setCompanyRepName(data.companyRepName);
				}
				if (data.companyBio) {
					setCompanyBio(data.companyBio);
				}
				if (data.website) {
					setWebsite(data.website);
				}
				if (data.email) {
					setEmail("mailto:" + data.email);
				}
				if (data.twitter) {
					setTwitter(data.twitter);
				}
				if (data.linkedin) {
					setLinkedin(data.linkedin);
				}
			} catch (error) {
				captureException(error);
			} finally {
				setLoading(false);
			}
		}
	};

	const loadBorrowerData = (jsonData) => {
		try {
			if (jsonData) {
				// Load the Logo image if there is any
				let imgUrl = getBorrowerLogoURL(
					jsonData.companyLogoFile.businessLogoFileCID,
					jsonData.companyLogoFile.businessLogoFileName
				);
				if (imgUrl) {
					setLogoImgSrc(imgUrl);
				}
				// Load rest of the data
				loadBorrowerProfileData(jsonData);

				console.log("work in progress");
			}
		} catch (error) {
			captureException(error);
		} finally {
			setLoading(false);
		}
	};

	const redirectToURl = (event) => {
		let url;
		let platform = event.target.id;

		switch (platform) {
			case "twitter":
				url = twitter;
				break;
			case "linkedin":
				url = linkedin;
				break;
			case "website":
				url = website;
				break;
			default:
				break;
		}

		if (url) {
			let protocol = "https://";
			let position = url.search(protocol);
			// if there is no "https://" in the url then it is not opened correctly
			if (position === -1) {
				url = protocol + url;
			}

			window.open(url, "_blank");
		}
	};

	const redirectForEmail = () => {
		if (email) {
			window.location.href = email;
		}
	};

	return (
		<>
			<div className="relative mb-16">
				{loading && <Loader />}
				<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
				<div className={`${loading ? "filter blur-sm" : ""}`}>
					{selected && <KYBModal handleForm={handleForm} />}
					{!profileStatus && (
						<div className="">
							<div className="flex items-center justify-between">
								<h2 className="font-semibold text-[1.4375rem] lg:text-[2.0625rem]">
									Borrower Profile
								</h2>

								<button
									onClick={() => navigate("/borrowerDashboard/editProfile")}
									className="CreateProfileIcon font-semibold border border-neutral-500 flex gap-1 items-center rounded-3xl py-2 px-3 sm:px-5"
								>
									<p>Create Profile</p>
									<Edits />
								</button>
							</div>
							<p className="justify-center flex text-[#64748B] mt-10">
								Complete your profile.
							</p>
						</div>
					)}
					{profileStatus ? (
						<>
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center ">
									<div className="avatar">
										<div className="rounded-full w-20">
											<img
												alt=""
												src={
													logoImgSrc
														? logoImgSrc
														: require("../../assets/noImage.jpeg")
												}
											/>
										</div>
									</div>
									<div className=" font-semibold ">
										<p className="text-[1.1875rem]">{companyName}</p>
										<p className="text-neutral-300">{companyRepName}</p>
									</div>
								</div>

								<button
									onClick={() =>
										navigate("/borrowerDashboard/editProfile", {
											state: borrowerJson ? borrowerJson : brJson,
										})
									}
									className="CreateProfileIcon border border-neutral-500 flex gap-1 items-center rounded-3xl py-2 px-3 sm:px-5"
								>
									<p>Edit Profile</p>
									<Edits />
								</button>
							</div>

							{!kycStatus ? (
								<div className="border border-r-[1.8rem] border-secondary-500 w-full md:w-[35rem] my-8 rounded-xl py-5 px-3 md:px-4 bg-lightmode-200 dark:bg-darkmode-800">
									<label id="blockpass-kyc-connect">
										<p className="font-semibold text-[1.1875rem]">
											Complete your KYC
										</p>
										<p>
											For Individuals - KYC verification includes verification
											of Identity Details and document verification such as
											utility bills as proof of address. Verifying your details
											ensures that you have a smooth and secure experience with
											us.
										</p>
									</label>
								</div>
							) : (
								<></>
							)}

							<div className=" font-semibold flex flex-col md:flex-row md:justify-between gap-2 mt-10">
								<h2 className="text-2xl font-semibold">Bio</h2>

								<div className=" flex gap-1 md:gap-3 ">
									{twitter ? (
										<button
											id="twitter"
											onClick={redirectToURl}
											className="CreateProfileIcon border border-neutral-500 flex gap-1 items-center py-1 px-2 rounded-2xl"
										>
											<Twitter />
											<p className="text-xs md:text-base pointer-events-none">
												twitter
											</p>
										</button>
									) : (
										<></>
									)}
									{linkedin ? (
										<button
											id="linkedin"
											onClick={redirectToURl}
											className="CreateProfileIcon border border-neutral-500 flex gap-1 items-center py-1 px-2 rounded-2xl"
										>
											<LinkedIn />
											<p className="text-xs md:text-base pointer-events-none">
												linkedIn
											</p>
										</button>
									) : (
										<></>
									)}
									{email ? (
										<button
											id="email"
											onClick={redirectForEmail}
											className="CreateProfileIcon border border-neutral-500 flex gap-1 items-center py-1 px-2 rounded-2xl"
										>
											<Email />
											<p className="text-xs md:text-base pointer-events-none">
												email
											</p>
										</button>
									) : (
										<></>
									)}
									{website ? (
										<button
											id="website"
											onClick={redirectToURl}
											className="border  border-neutral-500 flex gap-1 items-center py-1 px-2 rounded-2xl"
										>
											<Website />
											<p className="text-xs md:text-base pointer-events-none">
												website
											</p>
										</button>
									) : (
										<></>
									)}
								</div>
							</div>

							<div className="my-6">
								<p className="mt-1 text-lg css-fix">{companyBio}</p>
							</div>

							<div className="mb-8 font-semibold">
								<h3 className="text-[1.1875rem] mb-3">KYB Details</h3>
								<h5 className="text-[1.1875rem] text-neutral-400">
									Business Identify Proof
								</h5>
								<DocumentCard
									docName={
										brJson
											? brJson.businessIdFile.businessIdDocName
											: borrowerJson
											? borrowerJson.businessIdFile.businessIdDocName
											: ""
									}
									docCid={
										brJson
											? brJson.businessIdFile.businessIdFileCID
											: borrowerJson
											? borrowerJson.businessIdFile.businessIdFileCID
											: null
									}
									fileName={
										brJson
											? brJson.businessIdFile.businessIdFileName
											: borrowerJson
											? borrowerJson.businessIdFile.businessIdFileName
											: null
									}
								/>

								<h5 className="text-[1.1875rem] text-neutral-400">
									Business Address Proof
								</h5>
								<DocumentCard
									docName={
										brJson
											? brJson.businessAddFile.businessAddDocName
											: borrowerJson
											? borrowerJson.businessAddFile.businessAddDocName
											: null
									}
									docCid={
										brJson
											? brJson.businessAddFile.businessAddFileCID
											: borrowerJson
											? borrowerJson.businessAddFile.businessAddFileCID
											: null
									}
									fileName={
										brJson
											? brJson.businessAddFile.businessAddFileName
											: borrowerJson
											? borrowerJson.businessAddFile.businessAddFileName
											: null
									}
								/>
								<h5 className="text-[1.1875rem] text-neutral-400">
									Business Incorporation Proof
								</h5>
								<DocumentCard
									docName={
										brJson
											? brJson.businessIncoFile.businessIncoDocName
											: borrowerJson
											? borrowerJson.businessIncoFile.businessIncoDocName
											: null
									}
									docCid={
										brJson
											? brJson.businessIncoFile.businessIncoFileCID
											: borrowerJson
											? borrowerJson.businessIncoFile.businessIncoFileCID
											: null
									}
									fileName={
										brJson
											? brJson.businessIncoFile.businessIncoFileName
											: borrowerJson
											? borrowerJson.businessIncoFile.businessIncoFileName
											: null
									}
								/>
								<h5 className="text-[1.1875rem] text-neutral-400">
									Business License Proof
								</h5>
								{hasKey ? (
									<DocumentCard
										docName={
											brJson
												? brJson.businessLicFile.businessLicDocName
												: borrowerJson
												? borrowerJson.businessLicFile.businessLicDocName
												: null
										}
										docCid={
											brJson
												? brJson.businessLicFile.businessLicFileCID
												: borrowerJson
												? borrowerJson.businessLicFile.businessLicFileCID
												: null
										}
										fileName={
											brJson
												? brJson.businessLicFile.businessLicFileName
												: borrowerJson
												? borrowerJson.businessLicFile.businessLicFileName
												: null
										}
									/>
								) : (
									<DocumentCard docName={"No document added!"} disable={true} />
								)}
							</div>
						</>
					) : null}
				</div>
			</div>
		</>
	);
};

export default BorrowerProfile;
