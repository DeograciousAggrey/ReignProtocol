import React, { useEffect, useState } from "react";
import {
	getDrawdownOpportunities,
	getOpportunitysOf,
} from "../../services/BackendConnectors/opportunityConnectors";
import DrawdownCard from "./Components/Cards/DrawdownCard";
import OpportunityCardCollapsible from "./Components/Cards/OpportunityCardCollapsible";
import DashboardHeader from "./DashboardHeader";
import LoanFormModal from "./Components/Modal/LoanFormModal";
import axiosHttpService from "../../services/axioscall";
import { kycOptions } from "../../services/KYC/blockpass";
import { getUserWalletAddress } from "../../services/BackendConnectors/userConnectors/commonConnectors";
import ProcessingRequestModal from "./Components/Modal/ProcessingModal";
import KycCheckModal from "./Components/Modal/KycCheckModal";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import ProcessingDrawdownModal from "./Components/Modal/processingDrawdownModal";
import Loader from "../../uiTools/Loading/Loader";
import { getBorrowerDetails } from "../../services/BackendConnectors/userConnectors/borrowerConnectors";

const BorrowList = () => {
	const [data, setData] = useState([]);
	const [opportunities, setOpportunities] = useState([]);
	const [selected, setSelected] = useState(null);
	const [kycSelected, setKycSelected] = useState();
	const [borrowReqProcess, setBorrowReqProcess] = useState(false);
	const [processModal, setProcessModal] = useState(false);

	const [drawdownId, setDrawdownId] = useState("");
	const [processDrawdown, setProcessDrawdown] = useState();
	const [openProcessDrawdown, setOpenProcessDrawdown] = useState();
	const [loadDrawdownList, setLoadDrawdownList] = useState();

	const [loading, setLoading] = useState(true);
	const [kycStatus, setKycStatus] = useState();
	const [profileStatus, setProfileStatus] = useState();
	const [updateRepayment, setUpdateRepayment] = useState(12);
	const [checkForDrawdown, setCheckForDrawdown] = useState();

	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const [fileUpload, setFileUpload] = useState({});

	const handleForm = () => {
		setSelected(null);
		setKycSelected(null);
	};

	const cutProcessModal = () => {
		console.log("kadl");
		setSelected(null);
		setProcessModal(null);
	};

	useEffect(() => {
		const fetchData = async () => {
			let op = await getDrawdownOpportunities();
			if (op.success) {
				setData(op.opportunities);
			} else {
				console.log(op.msg, "+++++++++++");
				setErrormsg({
					status: !op.success,
					msg: op.msg,
				});
			}

			setLoading(false);
		};
		fetchData();
		getUserWalletAddress().then((res) => {
			if (res.success) {
				checkForKycAndProfile(res.address);
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
	}, [loadDrawdownList]);

	useEffect(() => {
		getOpportunitysOf()
			.then((res) => {
				if (res.success) {
					res.opportunities.sort(sortByProperty("epochCreationDate"));
					setOpportunities(res.opportunities);
				} else {
					console.log(res.msg);
				}
			})
			.catch((error) => console.log(error));
	}, [updateRepayment]);

	function sortByProperty(property) {
		return function (a, b) {
			if (a[property] < b[property]) return 1;
			else if (a[property] > b[property]) return -1;

			return 0;
		};
	}

	const checkForKycAndProfile = async (refId) => {
		try {
			const result = await axiosHttpService(kycOptions(refId));

			if (
				result.res.status === "success" &&
				result.res.data.status === "approved"
			) {
				setKycStatus(true);
			}
			if (result.res.status === "error") {
				setKycStatus(false);
			}
			getBorrowerDetails().then((res) => {
				if (res.borrowerCid) setProfileStatus(true);
				else setProfileStatus(false);
				setLoading(false);
			});
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="">
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			{loading && <Loader />}
			<DashboardHeader
				setSelected={setSelected}
				kycStatus={kycStatus}
				profileStatus={profileStatus}
				setKycSelected={setKycSelected}
			/>

			{selected && (
				<LoanFormModal
					handleForm={handleForm}
					setBorrowReqProcess={setBorrowReqProcess}
					setSelected={setSelected}
					setProcessModal={setProcessModal}
					setUpdateRepayment={setUpdateRepayment}
					setFileUpload={setFileUpload}
					setErrormsg={setErrormsg}
				/>
			)}

			{processModal && (
				<ProcessingRequestModal
					borrowReqProcess={borrowReqProcess}
					setSelected={setSelected}
					handleDrawdown={cutProcessModal}
					setProcessModal={setProcessModal}
					processModal={processModal}
					fileUpload={fileUpload}
				/>
			)}

			{kycSelected ? (
				<KycCheckModal kycStatus={kycStatus} profileStatus={profileStatus} />
			) : (
				<></>
			)}
			<div className="mt-8">
				<h2 className="font-semibold text-[1.4375rem] mb-4">Drawdown Funds</h2>
				{data.length === 0 ? (
					<div className="h-[10rem] flex items-center justify-center">
						<p className="text-lg font-semibold text-neutral-500">
							No drawdown available.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
						{data.map((item) => (
							<DrawdownCard
								key={item?.id}
								data={item}
								loadDrawdownList={setLoadDrawdownList}
								setOpenProcessDrawdown={setOpenProcessDrawdown}
								setProcessDrawdown={setProcessDrawdown}
								setUpdateRepayment={setUpdateRepayment}
								setDrawdownId={setDrawdownId}
								setCheckForDrawdown={setCheckForDrawdown}
								setErrormsg={setErrormsg}
							/>
						))}
					</div>
				)}

				{openProcessDrawdown ? (
					<ProcessingDrawdownModal
						processDrawdown={processDrawdown}
						handleDrawdown={cutProcessModal}
						drawdownId={drawdownId}
						checkForDrawdown={checkForDrawdown}
						setCheckForDrawdown={setCheckForDrawdown}
					/>
				) : (
					<></>
				)}
			</div>

			<div className="my-16">
				<h2 className="font-semibold text-[1.4375rem]">Borrow Request</h2>

				<div className="collapse">
					<input type="checkbox" className="peer" />
					<div className="collapse-title my-4 font-bold flex gap-4 md:gap-8 text-center py-6 border-y border-darkmode-500">
						<p className="w-1/3 md:w-1/4 ">Pool name</p>
						<p className="hidden md:block w-1/4 ">Capital requested</p>
						<p className="w-1/3  md:w-1/4 ">Created on</p>
						<p className="w-1/3  md:w-1/4 ">Status</p>
					</div>
				</div>
				{opportunities.length === 0 ? (
					<div className="h-[10rem] flex items-center justify-center">
						<p className="text-lg font-semibold text-neutral-500">
							No borrow request available.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{opportunities
							? opportunities.map((item) => (
									<OpportunityCardCollapsible key={item.id} data={item} />
							  ))
							: null}
					</div>
				)}
			</div>
		</div>
	);
};

export default BorrowList;
