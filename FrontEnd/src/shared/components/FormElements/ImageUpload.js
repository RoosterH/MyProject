import React, { useRef, useState, useEffect } from 'react';

import Button from './Button';
import Image from '../UIElements/Image';
import './ImageUpload.css';

const ImageUpload = props => {
	const [file, setFile] = useState();
	const [previewUrl, setPreviewUrl] = useState(props.previewUrl);
	const [isValid, setIsValid] = useState(true);
	const buttonText = props.buttonText
		? props.buttonText
		: 'SELECT IMAGE';

	// generate preview
	useEffect(() => {
		if (!file) {
			return;
		}
		// FileReader is a browser js API
		const fileReader = new FileReader();
		// before calling readAsDataURL, we need to register onLoad
		// So after readAsDataURL reads the file, onload will take care of the result
		fileReader.onload = () => {
			setPreviewUrl(fileReader.result);
		};
		fileReader.readAsDataURL(file);
	}, [file]);

	// create a ref of fil
	const filePickerRef = useRef();
	const pickImageHandler = () => {
		// click() is a method in <input /> DOM note, once it got clicked, it will open the file selector
		filePickerRef.current.click();
	};

	// get an event object, this event is the file been picked
	const pickedHandler = event => {
		let pickedFile;
		// Because useState does not udpate value immediately so we are unable
		// to pass isValid to props.onInput(). Instead we need to create a new
		// variable to pass to props.onInput()
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
		// we need to provide an onInput()
		// return values when onInput been called
		props.onInput(props.id, pickedFile, fileIsValid);
	};

	return (
		// form-control is @ input.css, css is available globally once it's imported.
		// Since we have imported input.css in input.js so we can use it here.
		<div className="form-control">
			<label htmlFor={props.id}>{props.label}</label>
			{/* The following input section is file picker, initially we want to hide it. 
			Once Button been clicked, pickImageHandler will be called.  It calls
			filePickerRef.current.click(); Inside <input> ref={filePickerRef}, it means 
			we are calling click() method of file picker DOM node. That is why file picker gets 
			displayed after button been clicked */}
			{/* {display: none} to hide the file picker but it is still a part of DOM*/}
			<input
				id={props.id}
				ref={filePickerRef}
				style={{ display: 'none' }}
				type="file"
				accept=".jpg,.jpeg,.png" // accept is a default attribute for input type ="file"
				onChange={pickedHandler} // gets triggered when a file been selected
			/>
			<div className={`image-upload ${props.center && 'center'}`}>
				{/* image previewer  */}
				<div className="image-upload__preview">
					{previewUrl && (
						<Image
							draggable="true"
							src={previewUrl}
							alt="Preview"
							// ondrag={() => props.onDrag()}
						/>
					)}
					{!previewUrl && <p>'Please pick an image.'</p>}
				</div>
				<Button type="button" onClick={pickImageHandler}>
					{buttonText}
				</Button>
			</div>
			{!isValid && <p>{props.errorText}</p>}
		</div>
	);
};

export default ImageUpload;
