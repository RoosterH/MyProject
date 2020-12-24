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
				value: '55',
				text: 'Online Registration $55',
				key: `regRadioOption_0`
			},
			{
				value: '50',
				text: 'On-Site Registration $50',
				key: `regRadioOption_1`
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
		canHaveDisplayHorizontal: true,
		inline: true,
		options: [
			{
				value: '0',
				text: 'SS',
				key: `RaceClassOption_0`
			},
			{
				value: '1',
				text: 'AS',
				key: `RaceClassOption_1`
			},
			{
				value: '2',
				text: 'BS',
				key: `RaceClassOption_2`
			},
			{
				value: '3',
				text: 'CS',
				key: `RaceClassOption_3`
			},
			{
				value: '4',
				text: 'DS',
				key: `RaceClassOption_4`
			},
			{
				value: '5',
				text: 'ES',
				key: `RaceClassOption_5`
			},
			{
				value: '6',
				text: 'FS',
				key: `RaceClassOption_6`
			},
			{
				value: '7',
				text: 'GS',
				key: `RaceClassOption_7`
			},
			{
				value: '8',
				text: 'HS',
				key: `RaceClassOption_8`
			},
			{
				value: '9',
				text: 'SSR',
				key: `RaceClassOption_9`
			},
			{
				value: '10',
				text: 'STU',
				key: `RaceClassOption_10`
			},
			{
				value: '11',
				text: 'STR',
				key: `RaceClassOption_11`
			},
			{
				value: '12',
				text: 'STX',
				key: `RaceClassOption_12`
			},
			{
				value: '13',
				text: 'STS',
				key: `RaceClassOption_13`
			},
			{
				value: '14',
				text: 'STH',
				key: `RaceClassOption_14`
			},
			{
				value: '15',
				text: 'SSP',
				key: `RaceClassOption_15`
			},
			{
				value: '16',
				text: 'ASP',
				key: `RaceClassOption_16`
			},
			{
				value: '17',
				text: 'BSP',
				key: `RaceClassOption_17`
			},
			{
				value: '18',
				text: 'CSP',
				key: `RaceClassOption_18`
			},
			{
				value: '19',
				text: 'DSP',
				key: `RaceClassOption_19`
			},
			{
				value: '20',
				text: 'ESP',
				key: `RaceClassOption_20`
			},
			{
				value: '21',
				text: 'FSP',
				key: `RaceClassOption_21`
			},
			{
				value: '22',
				text: 'SSM',
				key: `RaceClassOption_22`
			},
			{
				value: '23',
				text: 'SM',
				key: `RaceClassOption_23`
			},
			{
				value: '24',
				text: 'SMF',
				key: `RaceClassOption_24`
			},
			{
				value: '25',
				text: 'XP',
				key: `RaceClassOption_25`
			},
			{
				value: '26',
				text: 'CP',
				key: `RaceClassOption_26`
			},
			{
				value: '27',
				text: 'DP',
				key: `RaceClassOption_27`
			},
			{
				value: '28',
				text: 'EP',
				key: `RaceClassOption_28`
			},
			{
				value: '29',
				text: 'FP',
				key: `RaceClassOption_29`
			},
			{
				value: '30',
				text: 'AM',
				key: `RaceClassOption_30`
			},
			{
				value: '31',
				text: 'BM',
				key: `RaceClassOption_31`
			},
			{
				value: '32',
				text: 'CM',
				key: `RaceClassOption_32`
			},
			{
				value: '33',
				text: 'DM',
				key: `RaceClassOption_DM`
			},
			{
				value: '34',
				text: 'EM',
				key: `RaceClassOption_34`
			},
			{
				value: '35',
				text: 'FM',
				key: `RaceClassOption_35`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Run Group Single Day Single Selection',
		icon: 'far fa-dot-circle',
		label: '<strong>Run Group</strong>',
		field_name: 'RunGroupSingle-',
		required: true,
		options: [
			{
				value: '0',
				text: 'Morning Session 1',
				key: `RunGroupSingle_0`
			},
			{
				value: '1',
				text: 'Morning Session 2',
				key: `RunGroupSingle_1`
			},
			{
				value: '2',
				text: 'Afternoon Session 1',
				key: `RunGroupSingle_2`
			},
			{
				value: '3',
				text: 'Afternoon Session 2',
				key: `RunGroupSingle_3`
			},
			{
				value: '4',
				text: 'Afternoon Session 2',
				key: `RunGroupSingle_4`
			}
		]
	},
	{
		key: 'RadioButtons',
		canHaveAnswer: true,
		name: 'Work Assignment Single Day Single Selection',
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
	// ****** MultipleRadioButtonGroup ******//
	// We concat names to get field_name, field_name must be uniqute for all MultipleRadioButtonGroup
	// for example: field_name: LunchSelectionDay1- is from
	// "Lunch Selection" + "Day 1"
	// For option key, we add indeix number after field_name such as
	// option key: LunchSelectionDay1_0 is index 0 of
	// field_name: LunchSelectionDay1
	{
		key: 'MultipleRadioButtonGroup',
		canHaveAnswer: true,
		name: 'Run Groups For Multiple Days Event',
		icon: 'far fa-dot-circle',
		label: '<strong>Run Groups for Multiple Day Event</strong>',
		static: true,
		required: true,
		nested: true,
		options: [
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 1',
				label: '<strong>Day 1</strong>',
				field_name: 'RunGroupsForMultipleDaysEventDay1-',
				static: true,
				options: [
					{
						value: '0',
						text: 'Morning Group 1',
						key: `RunGroupsForMultipleDaysEventDay1_0`
					},
					{
						value: '1',
						text: 'Morning Group 2',
						key: `RunGroupsForMultipleDaysEventDay1_1`
					},
					{
						value: '2',
						text: 'Afternoon Group 1',
						key: `RunGroupsForMultipleDaysEventDay1_2`
					},
					{
						value: '3',
						text: 'Afternoon Group 2',
						key: `RunGroupsForMultipleDaysEventDay1_3`
					},
					{
						value: '4',
						text: 'Afternoon Group 3',
						key: `RunGroupsForMultipleDaysEventDay1_4`
					},
					{
						value: '5',
						text: 'Not Attending',
						key: `RunGroupsForMultipleDaysEventDay1_5`
					}
				]
			},
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 2',
				label: '<strong>Day 2</strong>',
				field_name: 'RunGroupsForMultipleDaysEventDay2-',
				static: true,
				options: [
					{
						value: '0',
						text: 'Morning Group 1',
						key: `RunGroupsForMultipleDaysEventDay2_0`
					},
					{
						value: '1',
						text: 'Morning Group 2',
						key: `RunGroupsForMultipleDaysEventDay2_1`
					},
					{
						value: '2',
						text: 'Afternoon Group 1',
						key: `RunGroupsForMultipleDaysEventDay2_2`
					},
					{
						value: '3',
						text: 'Afternoon Group 2',
						key: `RunGroupsForMultipleDaysEventDay2_3`
					},
					{
						value: '4',
						text: 'Afternoon Group 3',
						key: `RunGroupsForMultipleDaysEventDay2_4`
					},
					{
						value: '5',
						text: 'Not Attending',
						key: `RunGroupsForMultipleDaysEventDay2_5`
					}
				]
			}
		]
	},
	{
		key: 'MultipleRadioButtonGroup',
		canHaveAnswer: true,
		name: 'Worker Assignments For Multiple Days Event',
		icon: 'far fa-dot-circle',
		label:
			'<strong>Worker Assignments for Multiple Day Event</strong>',
		static: true,
		required: true,
		nested: true,
		options: [
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 1',
				label: '<strong>Day 1</strong>',
				field_name: 'WorkerAssignmentsForMultipleDaysEventDay1-',
				static: true,
				options: [
					{
						value: '0',
						text: 'Course Worker',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_0`
					},
					{
						value: '1',
						text: 'Starter',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_1`
					},
					{
						value: '2',
						text: 'Timing Slip',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_2`
					},
					{
						value: '3',
						text: 'Timing Trailer',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_3`
					},
					{
						value: '4',
						text: 'Tech Inspection',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_4`
					},
					{
						value: '5',
						text: 'Not Attending',
						key: `WorkerAssignmentsForMultipleDaysEventDay1_5`
					}
				]
			},
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 2',
				label: '<strong>Day 2</strong>',
				field_name: 'WorkerAssignmentsForMultipleDaysEventDay2-',
				static: true,
				options: [
					{
						value: '0',
						text: 'Course Worker',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_0`
					},
					{
						value: '1',
						text: 'Starter',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_1`
					},
					{
						value: '2',
						text: 'Timing Slip',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_2`
					},
					{
						value: '3',
						text: 'Timing Trailer',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_3`
					},
					{
						value: '4',
						text: 'Tech Inspection',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_4`
					},
					{
						value: '5',
						text: 'Not Attending',
						key: `WorkerAssignmentsForMultipleDaysEventDay2_5`
					}
				]
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
		name: 'Lunch Selection',
		icon: 'far fa-dot-circle',
		label: '<strong>Lunch Selection</strong>',
		static: true,
		required: true,
		nested: true,
		options: [
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 1',
				label: '<strong>Day 1</strong>',
				field_name: 'LunchSelectionDay1-',
				static: true,
				options: [
					{
						value: '10',
						text: 'Hamburger $10',
						key: `LunchSelectionDay1_0`
					},
					{
						value: '8',
						text: 'Sandwitch $8',
						key: `LunchSelectionDay1_1`
					},
					{
						value: '8',
						text: 'Veggie Sandwitch $8',
						key: `LunchSelectionDay1_2`
					},
					{
						value: '0',
						text: 'No lunch',
						key: `LunchSelectionDay1_3`
					}
				]
			},
			{
				key: 'RadioButtons',
				canHaveAnswer: true,
				name: 'Day 2',
				label: '<strong>Day 2</strong>',
				field_name: 'LunchSelectionDay2-',
				static: true,
				options: [
					{
						value: '1',
						text: 'Hamburger $1',
						key: `LunchSelectionDay2_0`
					},
					{
						value: '2',
						text: 'Sandwitch $2',
						key: `LunchSelectionDay2_1`
					},
					{
						value: '3',
						text: 'Veggie Sandwitch $3',
						key: `LunchSelectionDay2_2`
					},
					{
						value: '4',
						text: 'No lunch',
						key: `LunchSelectionDay2_3`
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
			}
			// {
			// 	key: 'RadioButtons',
			// 	canHaveAnswer: true,
			// 	name: 'Lunch Options',
			// 	icon: 'far fa-dot-circle',
			// 	label: '<strong>Lunch Selection</strong>',
			// 	field_name: 'Lunch-',
			// 	required: true,
			// 	options: [
			// 		{
			// 			value: '10',
			// 			text: 'Hamburger $10',
			// 			key: `lunchRadioOption_0`
			// 		},
			// 		{
			// 			value: '8',
			// 			text: 'Sandwitch $8',
			// 			key: `lunchRadioOption_1`
			// 		},
			// 		{
			// 			value: '8',
			// 			text: 'Veggie Sandwitch $8',
			// 			key: `lunchRadioOption_2`
			// 		},
			// 		{
			// 			value: '0',
			// 			text: 'No lunch',
			// 			key: `lunchRadioOption_3`
			// 		}
			// 	]
			// },
			// {
			// 	key: 'Checkboxes',
			// 	canHaveAnswer: true,
			// 	name: 'Run Group Multiple Selections',
			// 	icon: 'far fa-check-square',
			// 	label: '<strong>Run Group</strong>',
			// 	field_name: 'RunGroupMultiple-',
			// 	required: true,
			// 	options: [
			// 		{
			// 			value: '0',
			// 			text: 'Morning Session 1',
			// 			key: `RunGroupMultipleOption_0`
			// 		},
			// 		{
			// 			value: '1',
			// 			text: 'Morning Session 2',
			// 			key: `RunGroupMultipleOption_1`
			// 		},
			// 		{
			// 			value: '2',
			// 			text: 'Afternoon Session 1',
			// 			key: `RunGroupMultipleOption_2`
			// 		},
			// 		{
			// 			value: '3',
			// 			text: 'Afternoon Session 2',
			// 			key: `RunGroupMultipleOption_3`
			// 		},
			// 		{
			// 			value: '4',
			// 			text: 'Afternoon Session 3',
			// 			key: `RunGroupMultipleOption_4`
			// 		}
			// 	]
			// }
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
