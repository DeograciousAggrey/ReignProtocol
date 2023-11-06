import React, { useEffect, useState } from "react";
import Select from "react-select";

const customStyles = {
	control: (base, state) => ({
		...base,
		background: "#24272F",
		borderColor: "none",
		border: "none",
		marginLeft: "-0.70rem",
		boxShadow: state.isFocused ? null : null,
	}),
	menu: (provided, state) => ({
		...provided,
		background: "#24272F",
		// borderBottom: "none",
		color: "white",
		fontSize: 16,
		borderRadius: "0.5rem",
		paddingTop: 0,
		paddingBottom: 0,
		overflow: "hidden",
	}),
	singleValue: (provided, state) => {
		const color = "white";
		const fontSize = 15;
		return { ...provided, color, fontSize };
	},
	placeholder: (defaultStyles) => {
		return {
			...defaultStyles,
			color: "#A0ABBB",
		};
	},
	option: (styles, { data, isDisabled, isFocused, isSelected }) => {
		return {
			...styles,
			backgroundColor: isFocused ? "#6047FF" : null,
			paddingTop: 0,
			paddingBottom: 0,
			":active": {
				backgroundColor: "none",
			},
		};
	},
	menuList: (provided, state) => ({
		...provided,
		paddingTop: 0,
		paddingBottom: 0,
	}),
};

const customStylesLightmode = {
	control: (base, state) => ({
		...base,
		background: "#E7EAEE",
		borderColor: "none",
		border: "none",
		marginLeft: "-0.70rem",
		boxShadow: state.isFocused ? null : null,
	}),
	menu: (provided, state) => ({
		...provided,
		background: "#E7EAEE",
		// borderBottom: "none",
		color: "#323A46",
		fontSize: 16,
		borderRadius: "0.5rem",
		paddingTop: 0,
		paddingBottom: 0,
		overflow: "hidden",
	}),
	singleValue: (provided, state) => {
		const color = "#323A46";
		const fontSize = 15;
		return { ...provided, color, fontSize };
	},
	placeholder: (defaultStyles) => {
		return {
			...defaultStyles,
			color: "#A0ABBB",
		};
	},
	option: (styles, { data, isDisabled, isFocused, isSelected }) => {
		return {
			...styles,
			backgroundColor: isFocused ? "#6047FF" : null,
			paddingTop: 0,
			color: "black",
			paddingBottom: 0,
			":active": {
				backgroundColor: "none",
			},
		};
	},
	menuList: (provided, state) => ({
		...provided,
		paddingTop: 0,
		paddingBottom: 0,
	}),
};
const Selection = ({ onChange, value, placeholder, options, focus }) => {
	const [darkMode, setDarkMode] = useState(true);

	const defaultValue = (options, value) => {
		return options ? options.find((options) => options.value === value) : "";
	};

	useEffect(() => {
		darkModeStatus();
	}, []);

	function darkModeStatus() {
		if (localStorage.getItem("dark-mode") === "false") {
			setDarkMode(false);
		} else {
			setDarkMode(true);
		}
	}

	return (
		<Select
			className="w-[80%] appearance-none rounded-lg bg-lightmode-300 dark:bg-darkmode-700 text-black active:bg-[#24272F]"
			placeholder={placeholder}
			value={defaultValue(options, value)}
			openMenuOnFocus={true}
			styles={darkMode ? customStyles : customStylesLightmode}
			onChange={(value) => onChange(value)}
			options={options}
			onFocus={() => {
				focus(true);
			}}
			onBlur={() => {
				focus(false);
			}}
		/>
	);
};

export default Selection;
