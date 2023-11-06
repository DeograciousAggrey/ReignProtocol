import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getExtendableTextBreakup } from "../../services/Helpers/displayTextHelper";
import DocumentCard from "../../uiTools/Card/DocumentCard";
import Email from "../SVGIcons/Email";
import LinkedIn from "../SVGIcons/LinkedIn";
import Twitter from "../SVGIcons/Twitter";
import Website from "../SVGIcons/Website";
import Loader from "../../uiTools/Loading/Loader";

import { voteOpportunity } from "../../services/BackendConnectors/opportunityConnectors";
import axiosHttpService from "../../services/axioscall";
import { kycOptions } from "../../services/KYC/blockpass";
import default_profile from "../../assets/default_profile.svg";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import { getIPFSFileURL } from "../../services/Helpers/web3storageIPFS";

const PoolDetails = () => {
	const location = useLocation();
	const [expand, setExpand] = useState(false);
	const [opDetails, setOpDetails] = useState();
	const [companyDetails, setCompanyDetails] = useState();
	const [info, setInfo] = useState([]);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const [idproof, setIdproof] = useState();

	console.log(opDetails ? opDetails : "");

	const [loanPurpose, setLoanPurpose] = useState({
		isSliced: false,
		firstText: "",
		secondText: "",
	});

	const [status, setStatus] = useState({
		approve: false,
		unsure: false,
		reject: false,
	});

	const [loading, setLoading] = useState(false);

	const [logoImgSrc, setLogoImgSrc] = useState("");

	const checkForKycAndProfile = async (refId) => {
		try {
			const result = await axiosHttpService(kycOptions(refId));

			if (
				result.res.status === "success" &&
				result.res.data.status === "approved"
			) {
				if (result.res.data.identities["passport"]) {
					setIdproof(result.res.data.identities.passport);
				} else if (result.res.data.identities["national_id"]) {
					setIdproof(result.res.data.identities.national_id);
				} else if (result.res.data.identities["driving_license"]) {
					setIdproof(result.res.data.identities.driving_license);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		setOpDetails(location.state.pool);
		setLogoImgSrc(location.state.images);
	}, [location.state]);

	useEffect(() => {
		if (opDetails) {
			loadInfo();
			loadLoanPurpose();
			setCompanyDetails(opDetails.companyDetails);

			checkForKycAndProfile(opDetails.borrower);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opDetails]);

	function loadInfo() {
		if (opDetails) {
			setInfo([
				{
					label: "Opening Date",
					value: opDetails.createdOn ? opDetails.createdOn : "--",
				},
				{
					label: "Payment Frequency",
					value: opDetails.paymentFrequencyInDays
						? opDetails.paymentFrequencyInDays
						: "--",
				},
				{
					label: "Borrower Address",
					value: opDetails.borrowerDisplayAdd
						? opDetails.borrowerDisplayAdd
						: "--",
				},
				{
					label: "Interest Rate",
					value: opDetails.loanInterest ? opDetails.loanInterest : "--",
				},
				{
					label: "Payment Tenure",
					value: opDetails.loanTenure ? opDetails.loanTenure : "--",
				},
				{
					label: "Drawdown Cap",
					value: opDetails.opportunityAmount
						? opDetails.opportunityAmount
						: "--",
				},
			]);
			console.log(info);
		}
	}

	function loadLoanPurpose() {
		if (!opDetails || !opDetails.loan_purpose) {
			return;
		}
		const { isSliced, firstText, secondText } = getExtendableTextBreakup(
			opDetails.loan_purpose,
			200
		);

		if (isSliced) {
			setLoanPurpose({
				firstText: firstText,
				secondText: secondText,
				isSliced: isSliced,
			});
		} else {
			setLoanPurpose({
				firstText: firstText,
				isSliced: isSliced,
			});
		}
	}

	function updateStatus(vote) {
		if (vote === "1") {
			setStatus({ approve: false, unsure: false, reject: true });
		} else if (vote === "2") {
			setStatus({ approve: true, unsure: false, reject: false });
		} else if (vote === "3") {
			setStatus({ approve: false, unsure: true, reject: false });
		}
	}

	async function vote(voteID) {
		setLoading(true);
		const result = await voteOpportunity(opDetails.id, voteID);
		if (result.success) {
			updateStatus(voteID);
		} else {
			console.log(result.msg);
			setErrormsg({
				status: !result.success,
				msg: result.msg,
			});
		}

		setLoading(false);
	}

	const viewDocument = (docCid, fileName) => {
		if (!docCid) return null;
		let url = getIPFSFileURL(docCid);
		if (fileName) url += `/${fileName}`;
		console.log(fileName);
		window.open(url, "_blank");
	};

	const redirectToURl = (event) => {
		let url;

		switch (event.target.id) {
			case "twitter":
				url = companyDetails?.twitter;
				break;
			case "linkedin":
				url = companyDetails?.linkedin;
				break;
			case "website":
				url = companyDetails?.website;
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
		if (companyDetails?.email) {
			window.location.href = "mailto:" + companyDetails?.email;
		}
	};

	return (
		<div className={`${loading ? "" : ""}`}>
			{loading && <Loader />}
			{/* main container  */}
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<div className={`md:pt-7 ${loading ? "blur-sm" : ""}`}>
				{/*section-1*/}
				<div className="flex flex-col gap-6 overflow-hidden flex-wrap md:flex-row md:justify-between  ">
					{/* section-1-1 --profile  */}
					<div className="flex items-center gap-6 ">
						<div>
							<img
								alt="logo"
								src={logoImgSrc ? logoImgSrc : default_profile}
								className="w-20 h-20 rounded-full lg:w-24 lg:h-24 xl:w-28  xl:h-28"
							></img>
						</div>
						<div>
							<div className="font-medium text-2xl -mb-1 xl:text-3xl">
								{opDetails?.loan_name}
							</div>
							<div className="font-normal text-[#64748B]  xl:text-xl xl:font-light">
								{companyDetails?.companyName}
							</div>
						</div>
					</div>
					{/* section-1-2 --buttons */}
					<div className="flex  justify-around  gap-5 md:justify-end md:gap-2 ">
						{status.approve ||
						!(status.approve || status.reject || status.unsure) ? (
							<button
								disabled={status.approve}
								onClick={() => vote("2")}
								className={
									!status.approve
										? "rounded-full h-12 w-[29%]  transition ease-linear duration-500 overflow-hidden border-2 border-[#10B981] btn btn-xs btn-outline text-[#10B981] text-base  capitalize font-medium md:px-14"
										: "rounded-3xl py-1 px-2 approved-btn capitalize text-[#000000] font-medium md:h-8 md:mr-10"
								}
							>
								{status.approve ? "Approved" : "Approve"}
							</button>
						) : null}

						{status.reject ||
						!(status.approve || status.reject || status.unsure) ? (
							<button
								disabled={status.reject}
								onClick={() => vote("1")}
								className={
									!status.reject
										? "rounded-full h-12 w-[29%] transition ease-linear duration-500 overflow-hidden  border-2 border-[#EF4444] btn btn-xs btn-outline text-[#EF4444] text-base  capitalize font-medium md:px-14"
										: "rounded-3xl py-1 px-2 rejected-btn capitalize text-[#000000]  font-medium md:h-8 md:mr-10"
								}
							>
								{status.reject ? "Rejected" : "Reject"}
							</button>
						) : null}
						{/* {status.unsure ||
						!(status.approve || status.reject || status.unsure) ? (
							<button
								disabled={status.unsure}
								onClick={() => vote("3")}

								className="mr-0 rounded-full h-12 w-[29%] transition ease-linear duration-500 overflow-hidden  border-2 border-white btn btn-xs btn-outline text-white text-base  capitalize font-medium"
							>
								Unsure
							</button>
						) : null} */}
					</div>
					{/* <div className="flex items-center justify-center text-slate-400 font-medium cursor-pointer -mt-3 gap-2">
						Ask for more details
						<span>
							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15.667 0.666992H2.33366C1.41449 0.666992 0.666992 1.41449 0.666992 2.33366V12.3337C0.666992 13.2528 1.41449 14.0003 2.33366 14.0003H4.83366V17.1395L10.0645 14.0003H15.667C16.5862 14.0003 17.3337 13.2528 17.3337 12.3337V2.33366C17.3337 1.41449 16.5862 0.666992 15.667 0.666992ZM15.667 12.3337H9.60283L6.50033 14.1945V12.3337H2.33366V2.33366H15.667V12.3337Z"
									fill="#A0ABBB"
								/>
							</svg>
						</span>
					</div> */}
				</div>
				{/* section-2  --Deals overview*/}
				<div className="flex-row justify-between w-full felx">
					{/* section-2-1 --heading */}

					<div className="mt-10 mb-3 text-lg font-medium">Deal Overview</div>

					{/* Section-2-2 --text */}
					<div className="dark:text-[#D0D5DD] text-[323A46]  tracking-wide font-light text-lg">
						{loanPurpose.isSliced ? (
							<div>
								{loanPurpose.firstText}
								<span
									className=" font-semibold cursor-pointer"
									onClick={() => setExpand(true)}
								>
									{expand ? null : "... view more"}
								</span>
								{expand ? <div>{loanPurpose.secondText}</div> : null}
								<span
									className=" font-semibold cursor-pointer"
									onClick={() => setExpand(false)}
								>
									{expand ? "view less" : null}
								</span>
							</div>
						) : (
							<div className="font-light text-lg">{loanPurpose.firstText}</div>
						)}
					</div>
				</div>

				{/* section-3 --Deal Terms */}
				<div className="flex-col w-full flex">
					{/* section-3-1 --heading  */}
					<div className="flex-row justify-between mt-10 mb-3 flex">
						<div className="mb-0 text-lg font-medium">Deals terms</div>
					</div>
					{/* section-3-2 --item  */}
					<div className="rounded-box w-auto dark:bg-[#292C33] bg-[#A0ABBB] overflow-hidden">
						<div className="grid grid-cols-2 gap-[2px] my-0.5 md:my-0 md:grid-cols-3 xl:grid-cols-6">
							{info ? (
								info.map((e, i) => {
									return (
										<div
											key={i}
											className="flex justify-center flex-col items-center dark:bg-[#20232A] bg-[#D0D5DD] py-10"
										>
											<div className="font-medium text-base text-center dark:text-[#A0ABBB] text-[#64748B]">
												{e.label}
											</div>
											<div className="font-medium text-xl text-center">
												{e.value}
											</div>
										</div>
									);
								})
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
				{/*section-4  --Collateral*/}
				<div>
					<div className="text-lg font-medium mt-10 mb-3">Collateral</div>
					<div className="w-full dark:bg-[#20232A] bg-[#D0D5DD] rounded-xl p-3">
						<div className="dark:text-[#A0ABBB] text-[#4B5768] font-medium text-lg flex flex-col md:flex-row">
							<span>
								Name of documents{" "}
								<span className="text-[#323A46] dark:text-[white] pr-1">-</span>
							</span>
							<span className="text-[#323A46] dark:text-[white]">
								{opDetails?.collateral_document_name}
								<span
									className="pl-1 text-sm text-[#5375FE] cursor-pointer"
									onClick={() =>
										viewDocument(
											opDetails?.collateralDocument,
											opDetails?.collateral_filename
										)
									}
								>
									(view document)
								</span>
							</span>
						</div>
						<div className="text-lg font-medium mb-1">Document descripton</div>
						<div className="dark:text-[#D0D5DD] text-[#323A46] tracking-wide font-light text-lg px-1 mr-1 pr-6 items-start ">
							{opDetails?.collateral_document_description}
						</div>
					</div>
				</div>

				{/* section-5 --Borrower Details  */}
				<div className="flex flex-col w-full">
					<div className="flex items-center gap-2 text-lg font-medium mt-10 ">
						<img
							alt="logoimage"
							src={logoImgSrc ? logoImgSrc : default_profile}
							className="w-16 h-16 rounded-full md:hidden"
						></img>
						Borrower Details
					</div>
					{/* section-5-1 --social media*/}
					<div className=" flex flex-row-reverse  justify-between mt-5 md:hidden">
						{companyDetails?.twitter ? (
							<button
								id="twitter"
								className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  lowercase flex pb-5"
								onClick={redirectToURl}
							>
								<Twitter /> twitter
							</button>
						) : (
							<></>
						)}
						{companyDetails?.linkedin ? (
							<button
								id="linkedin"
								className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
								onClick={redirectToURl}
							>
								<LinkedIn />
								LinkedIn
							</button>
						) : (
							<></>
						)}
						{companyDetails?.email ? (
							<button
								id="email"
								className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
								onClick={redirectForEmail}
							>
								<Email />
								Email
							</button>
						) : (
							<></>
						)}
						{companyDetails?.website ? (
							<button
								id="website"
								className="btn btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
								onClick={redirectToURl}
							>
								<Website />
								Website
							</button>
						) : (
							<></>
						)}
					</div>
					{/* section-5-2 --Companyname*/}
					<div className="md:flex md:justify-between md:items-center md:mt-2 md:mb-3 ">
						<div className="text-lg font-medium mt-10 md:flex md:items-center gap-4 md:mt-0">
							<img
								alt="logoimage"
								src={logoImgSrc ? logoImgSrc : default_profile}
								className="w-16 h-16 rounded-full hidden md:block"
							></img>

							{companyDetails
								? companyDetails.companyName
								: "Name of the Company"}
						</div>
						<div className=" md:flex md:flex-row-reverse gap-4 md:justify-between hidden">
							{companyDetails?.twitter ? (
								<button
									id="twitter"
									className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  lowercase flex pb-5"
									onClick={redirectToURl}
								>
									<Twitter /> twitter
								</button>
							) : (
								<></>
							)}
							{companyDetails?.linkedin ? (
								<button
									id="linkedin"
									className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
									onClick={redirectToURl}
								>
									<LinkedIn />
									LinkedIn
								</button>
							) : (
								<></>
							)}
							{companyDetails?.email ? (
								<button
									id="email"
									className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
									onClick={redirectForEmail}
								>
									<Email />
									Email
								</button>
							) : (
								<></>
							)}
							{companyDetails?.website ? (
								<button
									id="website"
									className="btn  btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
									onClick={redirectToURl}
								>
									<Website />
									Website
								</button>
							) : (
								<></>
							)}
						</div>
					</div>

					{/* section-5-2 --Companybio*/}
					<div className="dark:text-[#D0D5DD] text-[#323A46] tracking-wide font-light text-lg  items-start">
						{companyDetails ? companyDetails.companyBio : ""}
					</div>
				</div>
				{/*section-6  --KYC detaial  */}
				<div className="w-full my-3 mt-10 text-lg font-medium xl:w-1/2">
					<div>KYC Details</div>
					<DocumentCard
						docName={idproof ? "Id proof" : ""}
						docCid={idproof ? idproof.value : null}
						fileName={idproof ? idproof.type : null}
					/>
				</div>

				{/*section-7  --KYB detaial  */}
				<div className="w-full my-3 mt-10 text-lg font-medium xl:w-1/2">
					<div>KYB Details</div>
					<h6 className="dark:text-[#A0ABBB] text-[#4B5768] mt-10 mb-0.5">
						Business Identify Proof
					</h6>
					<DocumentCard
						docName={
							companyDetails
								? companyDetails.businessIdFile.businessIdDocName
								: ""
						}
						docCid={
							companyDetails
								? companyDetails.businessIdFile.businessIdFileCID
								: null
						}
						fileName={
							companyDetails
								? companyDetails.businessIdFile.businessIdFileName
								: null
						}
					/>

					<h6 className="dark:text-[#A0ABBB] text-[#4B5768]  mb-0.5">
						Business Address Proof
					</h6>
					<DocumentCard
						docName={
							companyDetails
								? companyDetails.businessAddFile.businessAddDocName
								: ""
						}
						docCid={
							companyDetails
								? companyDetails.businessAddFile.businessAddFileCID
								: null
						}
						fileName={
							companyDetails
								? companyDetails.businessAddFile.businessAddFileName
								: null
						}
					/>
					<h6 className="dark:text-[#A0ABBB] text-[#4B5768]  mb-0.5">
						Business Incorporation Proof
					</h6>
					<DocumentCard
						docName={
							companyDetails
								? companyDetails.businessIncoFile.businessIncoDocName
								: ""
						}
						docCid={
							companyDetails
								? companyDetails.businessIncoFile.businessIncoFileCID
								: null
						}
						fileName={
							companyDetails
								? companyDetails.businessIncoFile.businessIncoFileName
								: null
						}
					/>
					{companyDetails && companyDetails.businessLicFile ? (
						<>
							<h6 className="dark:text-[#A0ABBB] text-[#4B5768]  mb-0.5">
								Business License Proof
							</h6>
							<DocumentCard
								docName={
									companyDetails
										? companyDetails.businessLicFile.businessLicDocName
										: ""
								}
								docCid={
									companyDetails
										? companyDetails.businessLicFile.businessLicFileCID
										: null
								}
								fileName={
									companyDetails
										? companyDetails.businessLicFile.businessLicFileName
										: null
								}
							/>
						</>
					) : (
						<></>
					)}
				</div>

				<br />
				<br />
				<br />
				<br />
				<br />
			</div>
		</div>
	);
};

export default PoolDetails;
