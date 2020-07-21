import React, { useState } from 'react';

import { IMAGE_TYPES } from '../../config/types';
import Image from '../UIElements/Image';

const ImageUploader = props => {
	const [previewUrl, setPreviewUrl] = useState();
	const handleImageChange = e => {
		e.preventDefault();
		let fileReader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			fileReader.onloadend = () => {
				// fileReader.result is different from file.name
				// fileReader.result contains metadata, file.name is a string
				setPreviewUrl(fileReader.result);
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
	return (
		<div>
			<label htmlFor={id} className={props.labelStyle}>
				{title} (size &#60; 1.5 MB) - jpg/png/gif
			</label>
			<input
				id={id}
				name={name}
				type="file"
				accept={[IMAGE_TYPES()]}
				onChange={handleImageChange}
				className={props.inputStyle}
			/>
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
