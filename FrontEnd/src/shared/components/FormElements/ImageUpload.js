import React, { useRef, useState, useEffect } from 'react';

import Button from './Button';
import './ImageUpload.css';

const ImageUpload = props => {
	const [file, setFile] = useState();
	const [previewUrl, setPreviewUrl] = useState();
	const [isValid, setIsValid] = useState(false);

	// create a ref pointing to <input />
	const filePickerRef = useRef();

	// generate preview
	useEffect(() => {
		if (!file) {
			return;
		}
		// FileReader is from browser side js
		const fileReader = new FileReader();
		// before calling readAsDataURL, we need to register onLoad
		// So after readAsDataURL reads the file, onload will take care of the result
		fileReader.onload = () => {
			setPreviewUrl(fileReader.result);
		};
		fileReader.readAsDataURL(file);
	}, [file]);

	const pickedHandler = event => {
		let pickedFile;
		// because useState does not udpate value immediately so we cannot use
		// isValid in props.onInput()
		let fileIsValid = isValid;
		// native js code event.target has type="file" will have "files"
		if (event.target.files && event.target.files.length === 1) {
			pickedFile = event.target.files[0];
			setFile(pickedFile);
			setIsValid(true);
			fileIsValid = true;
		} else {
			setIsValid(false);
			fileIsValid = false;
		}
		// return values when onInput been called
		props.onInput(props.id, pickedFile, fileIsValid);
	};

	const pickImageHandler = () => {
		// click() is a method in <input /> DOM note, once it got clicked, it will open the file selector
		filePickerRef.current.click();
	};

	return (
		// form-control is @ input.css, css is available globally once it's imported.
		// Since we have imported input.css in input.js so we can use it here.
		<div className="form-control">
			{/* {display: none} to hide the image. image is still a part of DOM*/}
			<input
				id={props.id}
				ref={filePickerRef}
				style={{ display: 'none' }}
				type="file"
				accept=".jpg,.jpeg,.png"
				onChange={pickedHandler}
			/>
			<div className={`image-upload ${props.center && 'center'}`}>
				<div className="image-upload__preview">
					{previewUrl && <img src={previewUrl} alt="Preview" />}
					{!previewUrl && <p>Please pick an image.</p>}
				</div>
				<Button type="button" onClick={pickImageHandler}>
					SELECT IMAGE{' '}
				</Button>
			</div>
			{!isValid && <p>{props.errorText}</p>}
		</div>
	);
};

export default ImageUpload;
