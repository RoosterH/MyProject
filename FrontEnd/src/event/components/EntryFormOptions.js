export const EntryFormOptions = () => [
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Registration Options',
		icon: 'far fa-dot-circle',
		label: '<strong>Registration Options</strong>',
		field_name: 'Registration-',
		required: true,
		options: [
			{
				value: '50',
				text: 'AAS Member $50',
				key: `regRadioOption_0`
			},
			{
				value: '60',
				text: 'AAS Member $60',
				key: `regRadioOption_1`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Run Group Single Selection',
		icon: 'far fa-dot-circle',
		label: '<strong>Run Group</strong>',
		field_name: 'RunGroupSingle-',
		required: true,
		options: [
			{
				value: '0',
				text: 'Morning Session 1',
				key: `raceRadioOption_0`
			},
			{
				value: '1',
				text: 'Morning Session 2',
				key: `raceRadioOption_1`
			},
			{
				value: '2',
				text: 'Afternoon Session 1',
				key: `raceRadioOption_2`
			},
			{
				value: '3',
				text: 'Afternoon Session 2',
				key: `raceRadioOption_3`
			},
			{
				value: '4',
				text: 'Afternoon Session 2',
				key: `raceRadioOption_4`
			}
		]
	},
	{
		key: 'Checkboxes',
		canHaveAnswer: true,
		name: 'Run Group Multiple Selections',
		icon: 'far fa-check-square',
		label: '<strong>Run Group</strong>',
		field_name: 'RunGroupMultiple-',
		required: true,
		options: [
			{
				value: '0',
				text: 'Morning Session 1',
				key: `raceCheckboxOption_0`
			},
			{
				value: '1',
				text: 'Morning Session 2',
				key: `raceCheckboxOption_1`
			},
			{
				value: '2',
				text: 'Afternoon Session 1',
				key: `raceCheckboxOption_2`
			},
			{
				value: '3',
				text: 'Afternoon Session 2',
				key: `raceCheckboxOption_3`
			},
			{
				value: '4',
				text: 'Afternoon Session 3',
				key: `raceCheckboxOption_4`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Race Class',
		icon: 'far fa-dot-circle',
		label: '<strong>Race Class</strong>',
		field_name: 'RaceClass-',
		required: true,
		options: [
			{
				value: '0',
				text: 'SS',
				key: `raceClassOption_0`
			},
			{
				value: '1',
				text: 'AS',
				key: `raceClassOption_1`
			},
			{
				value: '2',
				text: 'BS',
				key: `raceClassOption_2`
			},
			{
				value: '3',
				text: 'CS',
				key: `raceClassOption_3`
			},
			{
				value: '4',
				text: 'DS',
				key: `raceClassOption_4`
			},
			{
				value: '5',
				text: 'ES',
				key: `raceClassOption_5`
			},
			{
				value: '6',
				text: 'FS',
				key: `raceClassOption_6`
			},
			{
				value: '7',
				text: 'GS',
				key: `raceClassOption_7`
			},
			{
				value: '8',
				text: 'HS',
				key: `raceClassOption_8`
			},
			{
				value: '9',
				text: 'SSP',
				key: `raceClassOption_9`
			},
			{
				value: '10',
				text: 'ASP',
				key: `raceClassOption_10`
			},
			{
				value: '11',
				text: 'BSP',
				key: `raceClassOption_11`
			},
			{
				value: '12',
				text: 'CSP',
				key: `raceClassOption_12`
			},
			{
				value: '13',
				text: 'DSP',
				key: `raceClassOption_13`
			},
			{
				value: '14',
				text: 'ESP',
				key: `raceClassOption_14`
			},
			{
				value: '15',
				text: 'FSP',
				key: `raceClassOption_15`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Work Assignment',
		icon: 'far fa-dot-circle',
		label: '<strong>Work Assignment</strong>',
		field_name: 'WorkerAssignment-',
		required: true,
		options: [
			{
				value: '0',
				text: 'Course Worker',
				key: `workerRadioOption_0`
			},
			{
				value: '1',
				text: 'Starter',
				key: `workerRadioOption_1`
			},
			{
				value: '2',
				text: 'Timing Slip',
				key: `workerRadioOption_2`
			},
			{
				value: '3',
				text: 'Timing Trailer',
				key: `workerRadioOption_3`
			},
			{
				value: '4',
				text: 'Tech Inspection',
				key: `workerRadioOption_4`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Lunch Options',
		icon: 'far fa-dot-circle',
		label: '<strong>Lunch Selection</strong>',
		field_name: 'Lunch-',
		required: true,
		options: [
			{
				value: '10',
				text: 'Hamburger $10',
				key: `lunchRadioOption_0`
			},
			{
				value: '8',
				text: 'Sandwitch $8',
				key: `lunchRadioOption_1`
			},
			{
				value: '8',
				text: 'Veggie Sandwitch $8',
				key: `lunchRadioOption_2`
			},
			{
				value: '0',
				text: 'No lunch',
				key: `lunchRadioOption_3`
			}
		]
	},
	{
		key: 'ParagraphCheckbox',
		canHaveAnswer: true,
		name: 'Event Waiver',
		static: true,
		icon: 'far fa-check-square',
		label: '<strong>Event Waiver</strong>',
		content: 'Waiver...',
		field_name: 'Waiver-',
		required: true,
		options: [
			{
				value: '1',
				text:
					'I have read, understand and agree to limit my rights as defined in this waiver',
				key: `waiverCheckboxOption_0`
			}
		]
	},
	{
		key: 'ParagraphCheckbox',
		canHaveAnswer: true,
		name: 'Cancellation Refund Policy',
		static: true,
		icon: 'far fa-check-square',
		label: '<strong>Cancellation and Refund Policy</strong>',
		content:
			'Cancellation must be made one week before event starts to get full refund.',
		field_name: 'Cancellation-',
		required: true,
		options: [
			{
				value: '1',
				text: 'I accept the cancellation terms and conditions',
				key: `disclaimerCheckboxOption_0`
			}
		]
	},
	{
		key: 'Header',
		name: 'Header Text',
		icon: 'fa fa-header',
		static: true,
		content: 'Placeholder text...'
	},
	{
		key: 'Paragraph',
		name: 'Waiver Content',
		static: true,
		icon: 'fa fa-paragraph',
		content: 'Please enter waiver here...'
	},
	{
		key: 'Paragraph',
		name: 'Paragraph',
		static: true,
		icon: 'fas fa-paragraph',
		content: 'Placeholder text...'
	},
	{
		key: 'Checkboxes',
		canHaveAnswer: true,
		name: 'Checkboxes',
		icon: 'far fa-check-square',
		label: 'Placeholder Label',
		field_name: 'checkboxes_',
		options: []
	},
	{
		key: 'MultipleRadioButtonGroup',
		canHaveAnswer: true,
		name: 'Lunch Menu',
		icon: 'far fa-dot-circle',
		label: '<strong>Lunch Selection</strong>',
		static: true,
		required: true,
		nested: true,
		options: [
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Lunch Options',
				label: '<strong>Lunch Selection</strong>',
				field_name: 'Lunch-',
				required: true,
				options: [
					{
						value: '10',
						text: 'Hamburger $10',
						key: `lunchRadioOption_0`
					},
					{
						value: '8',
						text: 'Sandwitch $8',
						key: `lunchRadioOption_1`
					},
					{
						value: '8',
						text: 'Veggie Sandwitch $8',
						key: `lunchRadioOption_2`
					},
					{
						value: '0',
						text: 'No lunch',
						key: `lunchRadioOption_3`
					}
				]
			},
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Lunch Options',
				label: '<strong>Lunch Selection</strong>',
				field_name: 'Lunch-',
				required: true,
				options: [
					{
						value: '1',
						text: 'Hamburger $10',
						key: `lunchRadioOption_0`
					},
					{
						value: '2',
						text: 'Sandwitch $8',
						key: `lunchRadioOption_1`
					},
					{
						value: '3',
						text: 'Veggie Sandwitch $8',
						key: `lunchRadioOption_2`
					},
					{
						value: '4',
						text: 'No lunch',
						key: `lunchRadioOption_3`
					}
				]
			}
		]
	}

	// {
	// 	key: 'MultipleRadioButtonGroup',
	// 	canHaveAnswer: true,
	// 	name: 'Lunch Menu',
	// 	icon: 'far fa-dot-circle',
	// 	label: '<strong>Lunch Selection</strong>',
	// 	static: true,
	// 	required: true,

	// 	options: [
	// 		{
	// 			label: '<strong>Day 1</strong>',
	// 			field_name: 'Lunch-',
	// 			options: [
	// 				{
	// 					value: '10',
	// 					text: 'Hamburger $10',
	// 					key: `lunchRadioOption_0`
	// 				},
	// 				{
	// 					value: '8',
	// 					text: 'Sandwitch $8',
	// 					key: `lunchRadioOption_1`
	// 				},
	// 				{
	// 					value: '8',
	// 					text: 'Veggie Sandwitch $8',
	// 					key: `lunchRadioOption_2`
	// 				},
	// 				{
	// 					value: '0',
	// 					text: 'No lunch',
	// 					key: `lunchRadioOption_3`
	// 				}
	// 			]
	// 		}
	// 	]
	// }
];
