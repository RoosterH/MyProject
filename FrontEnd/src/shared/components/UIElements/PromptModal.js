import React from 'react';

import Modal from './Modal';
import Button from '../FormElements/Button';

const PromptModal = props => {
	console.log('in modal');
	return (
		<Modal
			{...props}
			onCancel={() => props.onCancel}
			onConfirm={() => props.onConfirm}
			header="Warning!"
			show={!!props.error}
			footer={
				<React.Fragment>
					<Button onClick={props.onCancel}>Cancel</Button>
					<Button onClick={props.onConfirm}>OK</Button>
				</React.Fragment>
			}>
			<p>{props.error}</p>
		</Modal>
	);
};

export default PromptModal;
