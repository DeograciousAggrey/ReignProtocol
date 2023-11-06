import React, { useEffect, useState } from "react";
import TransactionsCard from "../Underwriters/Components/TransactionsCard";
import { getApprovalHistory } from "../../services/BackendConnectors/userConnectors/underwriterConnectors";
import Loader from "../../uiTools/Loading/Loader";
import ErrorModal from "../../uiTools/Modal/ErrorModal";

const ApprovalHistory = () => {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	useEffect(() => {
		async function fetchData() {
			await getHistory();
			setLoading(false);
		}
		fetchData();
	}, []);

	async function getHistory() {
		let list = await getApprovalHistory();
		if (list.success) {
			setTransactions(list.opportunitiesList);
		} else {
			console.log(list.msg);
			setErrormsg({ status: !list.success, msg: list.msg });
		}
	}

	return (
		<div className={`mb-16 -mx-4 ${loading ? "relative h-[80vh]" : ""}`}>
			{loading && <Loader />}
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />

			<div className={`${loading ? "blur-sm" : ""}`}>
				<h2 className="text-2xl mb-2 md:mb-12 ml-5  md:ml-7">
					Approval history
				</h2>
				{transactions.length === 0 ? (
					<div className="relative h-screen flex justify-center">
						<div className="text-[#64748B] text-xl text-center mt-3 absolute top-40">
							<p>No Borrow requests are present at the moment.</p>
						</div>
					</div>
				) : (
					<div>
						<div className="collapse mb-3">
							<input type="checkbox" className="peer" />
							<div className="flex collapse-title  border-t-[1px] border-b-[1px]  border-t-[#B8C0CC] dark:border-t-[#20232A] border-b-[#B8C0CC] dark:border-b-[#20232A]  justify-between w-full items-center font-bold flex-wrap md:pr-5 md:pl-9 pr-2 pl-5">
								<p className="w-1/3 md:w-1/6 text-start">Pool Name</p>
								<p className="w-1/3 md:w-1/6 text-start">Company Name</p>
								<p className="w-1/3 md:w-1/6 text-center  hidden md:block">
									Created On
								</p>
								<p className="w-1/3 md:w-1/6 text-center">Decision</p>
							</div>
						</div>
						<div className="space-y-3 md:pl-5 md:pr-5 px-2">
							{transactions
								? transactions.map((item) => (
										<TransactionsCard key={Math.random()} data={item} />
								  ))
								: null}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ApprovalHistory;
