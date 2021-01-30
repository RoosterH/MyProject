import React, { useEffect, useState } from 'react';

import { IMAGE_TYPES } from '../../config/types';
import Image from '../UIElements/Image';

const FileUploader = props => {
	const handleImageChange = e => {
		e.preventDefault();
		let fileReader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			fileReader.onloadend = () => {
				// fileReader.result is different from file.name
				// fileReader.result contains metadata, file.name is a string
			};
			fileReader.readAsDataURL(file);
			// set value back to Formik
			props.setFieldValue(props.field.name, file);
		}
	};

	let name = props.field.name;
	let id = props.id;
	let errorMessage = props.errorMessage;
	let title = props.title;
	let required = props.required;
	let fileFormat = props.fileFormat;
	// accept is to specify accept file format. For csv, accept is '.csv'.
	let accept = props.accept;
	return (
		<div>
			<label htmlFor={id} className={props.labelStyle}>
				<i className="fal fa-image" />
				&nbsp; {title} (size &#60; 1.5 MB) - {fileFormat}
				{required && (
					<i
						className="far fa-gas-pump"
						style={{ color: 'Tomato' }}
					/>
				)}
			</label>
			<input
				id={id}
				name={name}
				type="file"
				accept={accept}
				onChange={handleImageChange}
				className={props.inputStyle}
			/>
			{/* Formik ErrorMessage not working for custom components */}
			{!!errorMessage && (
				<div className={props.errorStyle}>{errorMessage}</div>
			)}
		</div>
	);
};

export default FileUploader;
