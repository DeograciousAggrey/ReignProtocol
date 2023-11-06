import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../../uiTools/Button/PrimaryButton";
import dollarIcon from "../../../assets/Dollar-icon.svg";
import default_profile from "../../../assets/default_profile.svg";
import Loader from "../../../uiTools/Loading/Loader";
import {
	getBorrowerLogoURL,
	getOpportunityJson,
} from "../../../services/BackendConnectors/userConnectors/borrowerConnectors";

const UnderwriterCard = ({ data }) => {
	const path = useNavigate();
	const [companyName, setCompanyName] = useState();
	const [poolDetails, setPoolDetails] = useState();
	const [logoImgSrc, setLogoImgSrc] = useState();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// fetch the opportunity details from IPFS
		getOpportunityJson(data)
			.then((dataReader) => {
				if (dataReader) {
					dataReader.onloadend = function () {
						let opJson = JSON.parse(dataReader.result);
						if (opJson) {
							setPoolDetails({ ...data, ...opJson });
							setCompanyName(opJson.companyDetails?.companyName);
							let imgUrl = getBorrowerLogoURL(
								opJson.companyDetails?.companyLogoFile?.businessLogoFileCID,
								opJson.companyDetails?.companyLogoFile?.businessLogoFileName
							);
							if (imgUrl) {
								setLogoImgSrc(imgUrl);
							}
						}
					};
				}
			})
			.catch((err) => console.log(err))
			.finally(() => {
				setLoading(false);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="relative">
			{loading && <Loader />}
			<div
				className={`my-gradient dark:text-white text-black max-w-lg md:max-w-full rounded-2xl grid  grid-1 overflow-hidden  pt-7 lg:pt-0 lg:grid-cols-10  xl:pr-5 2xl:gap-3 md:px-2 lg:pr-5 ${
					loading ? "blur-sm" : ""
				}`}
			>
				{/* section-1 */}
				<div className="flex-row flex space-x-5 px-4 col-span-4 lg:pl-5 lg:pr-1">
					<img
						alt=""
						src={logoImgSrc ? logoImgSrc : default_profile}
						className="w-28 h-28 lg:my-auto rounded-full xl:w-36  xl:h-36 2xl:w-[7.5rem] 2xl:h-[7.5rem]"
					/>
					<div className="mt-7 -space-y-1 lg:hidden ">
						<p className="font-medium text-2xl">
							{data.opportunityName ? data.opportunityName : "Name of Pool"}
						</p>
						<p className="font-light text-sm">
							{companyName ? companyName : "Name of Company"}
						</p>
					</div>
				</div>
				{/* section-2 */}
				<div className="col-span-6 xl:-ml-4">
					{/* section-2-1  */}
					<div className="mt-5 px-4 lg:pr-4 lg:pl-1 ">
						<div className="hidden -space-y-1 lg:block lg:my-7 ">
							<p className="font-medium text-2xl">
								{data.opportunityName ? data.opportunityName : "Name of Pool"}
							</p>
							<p className="font-light text-sm">
								{companyName ? companyName : "Name of Company"}
							</p>
						</div>
						<div className="flex justify-between space-y-1 font-medium">
							<p>Pool Size</p>
							<p className="flex gap-1 justify-center">
								<span className="w-6 h-6">
									<img src={dollarIcon} alt="" />
								</span>
								{data.opportunityAmount}
							</p>
						</div>
						<div className="flex justify-between space-y-1  font-medium ">
							<p>Interest Rate</p>
							<p>{data.loanInterest}</p>
						</div>
						<div className="flex justify-between space-y-1  font-medium ">
							<p>Created On</p>
							<p>{data.createdOn}</p>
						</div>
					</div>
					{/* section-2-2*/}
					<div className="flex mt-5 justify-center mb-5  px-4  lg:px-1 ">
						{/* add (place-items-center) for button center */}
						<PrimaryButton
							disable={false}
							onClick={() =>
								path("/diligenceExpert/poolDetail", {
									state: { pool: poolDetails, images: logoImgSrc },
								})
							}
						>
							View details
						</PrimaryButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UnderwriterCard;
