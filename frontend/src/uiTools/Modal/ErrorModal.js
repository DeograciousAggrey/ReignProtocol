import React from "react";
import { getOnlyErrorText } from "../../services/Helpers/displayTextHelper";

const ErrorModal = ({ errormsg, setErrormsg }) => {
	const unCatcherror1 = errormsg?.msg?.includes("missing revert");
	const unCatcherror2 = errormsg?.msg?.includes("https://");
	if (unCatcherror1) {
		setErrormsg((prev) => ({ ...prev, msg: "Please reload this page" }));
	}
	if (unCatcherror2) {
		setErrormsg({ status: false, msg: "" });
	}
	const metamaskerr1 = errormsg?.msg?.includes("invalid address");
	const metamaskerr2 = errormsg?.msg?.includes("unknown account");
	if (metamaskerr1 || metamaskerr2) {
		setErrormsg((prev) => ({
			...prev,
			msg: "Please open the metamask and login",
		}));
	}

	return (
		<>
			<input
				type="checkbox"
				className="modal-toggle"
				checked={errormsg.status}
				readOnly
			/>
			<div
				style={{ backdropFilter: "brightness(100%) blur(8px)" }}
				className="modal"
			>
				<div className="relative p-4 w-full max-w-md h-full md:h-auto z-50">
					<div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
						<button
							type="button"
							className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
							data-modal-toggle="popup-modal"
							onClick={() => {
								setErrormsg({ status: false, msg: "" });
							}}
						>
							<svg
								aria-hidden="true"
								className="w-5 h-5"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="sr-only">Close modal</span>
						</button>
						<div className="p-6 text-center overflow-hidden">
							<svg
								aria-hidden="true"
								className="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
								{errormsg.msg ? getOnlyErrorText(errormsg.msg) : "No Error"}
							</h3>
							<button
								onClick={() => {
									setErrormsg({ status: false, msg: "" });
								}}
								data-modal-toggle="popup-modal"
								type="button"
								className={`py-2 px-6 bg-gradient-to-r from-[#4B74FF] to-[#9281FF] hover:from-[#9281FF] hover:to-[#4B74FF] capitalize font-medium border-none text-white rounded-3xl focus:outline-[#9281FF]`}
							>
								Go back
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ErrorModal;
