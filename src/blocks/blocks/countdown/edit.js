/**
 * External dependencies.
 */

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { useViewportMatch } from '@wordpress/compose';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

import moment from 'moment';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import {
	blockInit,
	useCSSNode
} from '../../helpers/block-utility';
import Inspector from './inspector.js';
import {
	boxValues,
	getIntervalFromUnix,
	getTimezone
} from '../../helpers/helper-functions.js';
import DisplayTime from './components/display-time.js';
import { at, isNumber } from 'lodash';

const { attributes: defaultAttributes } = metadata;

const px = value => isNumber( value ) ? `${ value }px` : value;

/**
 *
 * @param {import('./types').CountdownProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	const [ unixTime, setUnixTime ] = useState( 0 );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	/**
	 * Update the time interval
	 */
	useEffect( () => {
		const interval = setInterval( () => {
			if ( attributes.date ) {
				let date = attributes.date + getTimezone();
				date = moment( date ).unix() * 1000;
				setUnixTime( new Date( date ) - new Date() );
			}
		}, 500 );

		return () => {
			clearInterval( interval );
		};
	}, [ attributes.date ]);


	// Add `border-radius` for all the platforms
	const borderRadius = 'linked' === attributes.borderRadiusType ? attributes.borderRadius + '%' : `${ attributes.borderRadiusTopLeft }% ${ attributes.borderRadiusTopRight }% ${ attributes.borderRadiusBottomRight }% ${ attributes.borderRadiusBottomLeft }%`;

	const inlineStyles = {
		'--backgroundColor': attributes.backgroundColor,
		'--borderColor': attributes.borderColor,
		'--borderRadius': borderRadius,
		'--backgroundColor': attributes.backgroundColor,
		'--borderColor': attributes.borderColor,
		'--borderRadius': borderRadius,
		'--width': attributes.containerWidth,
		'--widthTablet': attributes.containerWidthTablet,
		'--widthMobile': attributes.containerWidthMobile,
		'--height': px( attributes.height ),
		'--heightTablet': px( attributes.heightTablet ),
		'--heightMobile': px( attributes.heightMobile ),
		'--borderWidth': px( attributes.borderWidth ),
		'--borderWidthTablet': px( attributes.borderWidthTablet ),
		'--borderWidthMobile': px( attributes.borderWidthMobile ),
		'--gap': px( attributes.gap ),
		'--gapTablet': px( attributes.gapTablet ),
		'--gapMobile': px( attributes.gapMobile ),
		'--valueFontSize': px( attributes.valueFontSize ),
		'--valueFontSizeTablet': px( attributes.valueFontSizeTablet ),
		'--valueFontSizeMobile': px( attributes.valueFontSizeMobile ),
		'--labelFontSize': px( attributes.labelFontSize ),
		'--labelFontSizeTablet': px( attributes.labelFontSizeTablet ),
		'--labelFontSizeMobile': px( attributes.labelFontSizeMobile ),
		'--alignment': attributes.alignment,
		'--padding': boxValues( attributes.padding ),
		'--paddingTablet': boxValues( attributes.paddingTablet ),
		'--paddingMobile': boxValues( attributes.paddingMobile )
	};

	const [ cssNodeName, setCSS ] = useCSSNode();
	useEffect( ()=>{
		setCSS([
			`.otter-countdown__display-area .otter-countdown__value {
				color: ${ attributes.valueColor };
			}`,
			`.otter-countdown__display-area .otter-countdown__label {
				color: ${ attributes.labelColor };
			}`,
			`.otter-countdown__display-area[name="separator"] .otter-countdown__value {
				color: ${ attributes.separatorColor };
			}`
		]);
	}, [ attributes.valueColor, attributes.labelColor, attributes.separatorColor ]);


	const blockProps = useBlockProps({
		id: attributes.id,
		className: cssNodeName,
		style: inlineStyles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<DisplayTime
					time={ getIntervalFromUnix( unixTime, { exclude: attributes?.exclude }) }
					hasSeparators={ attributes.hasSeparators }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
