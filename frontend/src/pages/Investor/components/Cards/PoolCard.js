import React, { useState, useEffect } from "react";
import DygnifyImage from "../../../../assets/Dygnify_Image.png";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import {
	getBorrowerLogoURL,
	getOpportunityJson,
} from "../../../../services/BackendConnectors/userConnectors/borrowerConnectors";

const PoolCard = ({ data }) => {
	const {
		opportunityInfo,
		opportunityAmount,
		estimatedAPY,
		capitalInvested,
		yieldGenerated,
	} = data;

	const [companyName, setCompanyName] = useState();
	const [logoImgSrc, setLogoImgSrc] = useState();

	useEffect(() => {
		// fetch the opportunity details from IPFS
		getOpportunityJson(data).then((read) => {
			if (read) {
				read.onloadend = function () {
					let opJson = JSON.parse(read.result);
					if (opJson) {
						setCompanyName(opJson.company_name);
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
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex flex-col gap-6 px-4 py-6 rounded-xl sm:px-8 lg:flex-row md:w-[48%] 2xl:w-[min(32%,30rem)]  my-gradient">
			<div className="flex items-center gap-6">
				<img
					style={{ borderRadius: "50%", aspectRatio: "1/1" }}
					className="w-[7rem] lg:w-[12rem]"
					src={logoImgSrc ? logoImgSrc : DygnifyImage}
					alt=""
				/>

				<div className="lg:hidden">
					<p className="text-2xl font-semibold">{data?.opportunityName}</p>
					<p>{companyName}</p>
				</div>
			</div>

			<div className="flex flex-col gap-6 lg:w-[75%]">
				<div className="hidden lg:block">
					<p className="text-2xl font-semibold">{data?.opportunityName}</p>
					<p>{companyName}</p>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex gap-1 font-semibold">
						<p>Pool Size</p>

						<img src={DollarImage} className="ml-auto w-[1rem]" alt="" />
						<p>{opportunityAmount}</p>
					</div>
					<div className="flex gap-1 font-semibold">
						<p>Capital Invested</p>

						<img src={DollarImage} className="ml-auto w-[1rem]" alt="" />
						<p>{capitalInvested}</p>
					</div>
					<div className="flex gap-1 font-semibold">
						<p>Estimated APY</p>

						<p className=" ml-auto">{estimatedAPY}</p>
					</div>
					<div className="flex gap-1 font-semibold">
						<p>Yield Generated</p>

						<img src={DollarImage} className="ml-auto w-[1rem]" alt="" />
						<p>{yieldGenerated ? yieldGenerated : "--"}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PoolCard;
