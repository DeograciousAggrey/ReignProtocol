import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../../../uiTools/Button/PrimaryButton";
import DygnifyImage from "../../../../assets/Dygnify_Image.png";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import {
	getBorrowerLogoURL,
	getOpportunityJson,
} from "../../../../services/BackendConnectors/userConnectors/borrowerConnectors";

const ViewPoolCard = ({ data, kycStatus, isSenior, onClick }) => {
	const path = useNavigate();
	const { opportunityInfo, opportunityAmount, loanInterest, isFull } = data;

	const [companyName, setCompanyName] = useState();
	const [logoImgSrc, setLogoImgSrc] = useState();
	const [opData, setOpData] = useState();

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
						setOpData(opJson);
					}
				};
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const StatusButton = ({ className, isFullStatus }) => {
		return (
			<div
				style={{
					backgroundImage: `${
						isFullStatus
							? "linear-gradient(95.8deg, #FFE202 5%, #F2B24E 95.93%)"
							: "linear-gradient(97.78deg, #51B960 7.43%, #51B960 7.43%, #51B960 7.43%, #83DC90 90.63%)"
					}`,
				}}
				className={`${className} text-black px-3 rounded-2xl`}
			>
				<p>{isFullStatus ? "Full" : "Open"}</p>
			</div>
		);
	};

	return (
		<div
			className={`flex flex-col gap-6 px-4 py-6 rounded-xl sm:px-8 lg:flex-row md:w-[48%] 2xl:w-[min(32%,30rem)]  my-gradient`}
		>
			<div className="flex items-center gap-6">
				<img
					alt=""
					style={{ borderRadius: "50%", aspectRatio: "1/1" }}
					className="w-[7rem] lg:w-[6rem] xl:w-[10rem] 2xl:w-[8rem]"
					src={logoImgSrc ? logoImgSrc : DygnifyImage}
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

				<div className="flex flex-col gap-1 font-semibold">
					<div className="flex gap-1">
						<p className="">Pool Size</p>
						<img src={DollarImage} className="ml-auto w-[1rem]" alt="" />
						<p className="">{opportunityAmount}</p>
					</div>

					<div className="flex">
						<p className="">Estimated APY</p>
						<p className="ml-auto ">{loanInterest}</p>
					</div>
					<div className="flex">
						<p className="">Status</p>

						<StatusButton className="ml-auto" isFullStatus={isFull} />
					</div>
				</div>

				<div className="">
					<PrimaryButton
						className="w-[100%] text-white"
						onClick={() =>
							!isSenior
								? path("/investorDashboard/viewPool", {
										state: {
											...data,
											opData: opData,
											kycStatus: kycStatus,
										},
								  })
								: onClick()
						}
					>
						View Pool
					</PrimaryButton>
				</div>
			</div>
		</div>
	);
};

export default ViewPoolCard;
