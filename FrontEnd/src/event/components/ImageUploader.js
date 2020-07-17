import React, { useState } from 'react';

import { IMAGE_TYPES } from '../../shared/config/types';
import Image from '../../shared/components/UIElements/Image';
import '../pages/EventForm.css';

const ImageUploader = props => {
	const [previewUrl, setPreviewUrl] = useState();
	// const SUPPORTED_FORMAT = IMAGE_TYPES;
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
	return (
		<div>
			<label htmlFor={id} className="event-form__label">
				{name} - jpg/png/gif
			</label>
			<input
				id={id}
				name={name}
				type="file"
				accept={[IMAGE_TYPES()]}
				onChange={handleImageChange}
				className="event-form__field-select"
			/>
			{!errorMessage && previewUrl && (
				<div className="image-upload__preview">
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
				<div className="event-form__field-error">{errorMessage}</div>
			)}
		</div>
	);
};

export default ImageUploader;
