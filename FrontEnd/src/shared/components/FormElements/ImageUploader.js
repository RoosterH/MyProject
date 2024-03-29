import React, { useEffect, useState } from 'react';

import { IMAGE_TYPES } from '../../config/types';
import Image from '../UIElements/Image';

const ImageUploader = props => {
	const [previewUrl, setPreviewUrl] = useState();
	const [currentUrl, setCurrentUrl] = useState();

	useEffect(() => {
		setCurrentUrl(props.field.value);
	}, [props]);

	const handleImageChange = e => {
		e.preventDefault();
		let fileReader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			fileReader.onloadend = () => {
				// fileReader.result is different from file.name
				// fileReader.result contains metadata, file.name is a string
				setPreviewUrl(fileReader.result);
				setCurrentUrl(null);
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
	return (
		<div>
			<label htmlFor={id} className={props.labelStyle}>
				<i className="fal fa-image" />
				&nbsp; {title} (size &#60; 1.5 MB) - jpg/png/gif {'  '}
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
				accept={[IMAGE_TYPES()]}
				onChange={handleImageChange}
				className={props.inputStyle}
			/>
			{!errorMessage && !previewUrl && currentUrl && (
				<React.Fragment>
					<label htmlFor={id} className={props.labelStyle}>
						Current Image
					</label>
					<div className={props.previewStyle}>
						<Image
							draggable="true"
							src={currentUrl}
							// src={process.env.REACT_APP_ASSET_URL + `/${currentUrl}`}
							alt="Existing file"
							// ondrag={() => props.onDrag()}
						/>
					</div>
				</React.Fragment>
			)}
			{!errorMessage && previewUrl && (
				<div className={props.previewStyle}>
					{previewUrl && (
						<Image
							draggable="true"
							src={previewUrl}
							alt="Preview"
							// ondrag={() => props.onDrag()}
						/>
					)}
				</div>
			)}
			{/* Formik ErrorMessage not working for custom components */}
			{!!errorMessage && (
				<div className={props.errorStyle}>{errorMessage}</div>
			)}
		</div>
	);
};

export default ImageUploader;
