import React from "react";

const Loading = () => {
	return (
		// <div>
		//   <div class="flex justify-center items-center" style={{ display: "flex" }}>
		//     <div
		//       class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue"
		//       role="status"
		//     >
		//       <span class="visually-hidden">Loading...</span>
		//     </div>
		//   </div>
		// </div>

		<div
			style={{ display: "flex" }}
			className="z-10 w-60 gap-4 items-center justify-center"
		>
			<div className="animate-spin border-solid border-4 border-t-[#14171F] border-[#6047FF] w-10 h-10 rounded-full"></div>
			<span className="text-xl select-none">Saving...</span>
		</div>
	);
};

export default Loading;
