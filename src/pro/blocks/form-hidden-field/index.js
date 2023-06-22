/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../blocks/helpers/icons.js';
import edit from './edit.js';

import { useBlockProps } from '@wordpress/block-editor';
import Inactive from '../../components/inactive';


const { name } = metadata;

console.log( 'Hidden Field Added' );

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

// if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
// 	edit = () => <Inactive
// 		icon={ icon }
// 		label={ metadata.title }
// 		blockProps={ useBlockProps() }
// 	/>;
// }


registerBlockType( name, {
	...metadata,
	icon,
	edit,
	save: () => null
});
