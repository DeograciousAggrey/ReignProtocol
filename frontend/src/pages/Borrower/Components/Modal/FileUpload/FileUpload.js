import { useRef, useState } from "react";
import { getTrimmedWalletAddress } from "../../../../../services/Helpers/displayTextHelper";

function FileUpload({ fileName, progress, status }) {
	const [color, setColor] = useState("text-warning-500");
	const progressRef = useRef();
	const statusRef = useRef();
	const progressValueRef = useRef();

	document.addEventListener("progressDetail", (e) => {
		const { file, progress, status } = e.detail;
		let warningColor = "text-warning-500";
		let success = "text-success-500";

		// let status =
		// progress === 100 ? "Completed" : progress > 0 ? "Uploading" : "Pending";

		if (file === fileName) {
			progressValueRef.current.value = progress;
			progressRef.current.innerHTML = `${progress}%`;
			statusRef.current.innerHTML = status;

			if (status === "Uploading" || status === "Pending") {
				setColor(warningColor);
			} else {
				setColor(success);
			}
		}
	});

	return (
		<div className=" rounded-md bg-neutral-200 dark:bg-darkmode-50 p-2 pb-0">
			<div className="flex justify-between mb-2">
				<p>
					File Name:{" "}
					<span className="underline cursor-default">
						{getTrimmedWalletAddress(fileName, 10)}
					</span>
				</p>

				<p>
					Status:{" "}
					<span className={color} ref={statusRef}>
						{status}
					</span>
				</p>
			</div>

			<div className="relative">
				<span
					className="absolute text-sm left-1/2 translate-x-[-50%]"
					ref={progressRef}
				>
					{progress}%
				</span>
				<progress
					className={`w-full bg-gray-100 dark:bg-gray-500 m-0 rounded-lg`}
					value="0"
					max="100"
					ref={progressValueRef}
				></progress>
			</div>
		</div>
	);
}

export default FileUpload;
