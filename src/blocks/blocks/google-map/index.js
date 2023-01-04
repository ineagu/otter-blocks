/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { googleMapIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';
import transforms from './transforms.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Google Maps', 'otter-blocks' ),
	description: __( 'Display Google Maps on your website with Google Map block. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'map',
		'google',
		'orbitfox'
	],
	transforms,
	edit,
	save: () => null
});
