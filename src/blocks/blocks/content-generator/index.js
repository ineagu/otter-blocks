/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { aiGeneration as icon, formAiGeneration, contentAiGenerationIcon } from '../../helpers/icons.js';
import edit from './edit.js';
import './editor.scss';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	icon,
	keywords: [
		'content',
		'ai',
		'layout'
	],
	edit,
	save: () => null,
	variations: [
		{
			name: 'themeisle-blocks/content-generator-form',
			description: __( 'Generate Form with OpenAI.', 'otter-blocks' ),
			icon: formAiGeneration,
			title: __( 'AI Form Generator', 'otter-blocks' ),
			scope: [ 'block' ],
			attributes: {
				promptID: 'form'
			}
		},
		{
			name: 'themeisle-blocks/content-generator-content',
			description: __( 'Generate new content with OpenAI.', 'otter-blocks' ),
			icon: contentAiGenerationIcon(),
			title: __( 'AI Content Generator', 'otter-blocks' ),
			scope: [ 'block' ],
			attributes: {
				promptID: 'textTransformation'
			}
		},
		{
			name: 'themeisle-blocks/content-generator-layout',
			description: __( 'Use AI to pick Otter patterns that fits your needs.', 'otter-blocks' ),
			icon: contentAiGenerationIcon(),
			title: __( 'Smart Patterns Picker', 'otter-blocks' ),
			scope: [ 'block' ],
			attributes: {
				promptID: 'patternsPicker'
			}
		}
	]
});
