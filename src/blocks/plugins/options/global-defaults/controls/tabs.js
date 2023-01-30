// @ts-check

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	TextareaControl,
	__experimentalBoxControl as BoxControl,
	FontSizePicker,
	Disabled
} from '@wordpress/components';

import { Fragment, useState } from '@wordpress/element';
import { ColorDropdownControl, ResponsiveControl, ToogleGroupControl } from '../../../../components';
import { useResponsiveAttributes } from '../../../../helpers/utility-hooks';
import { isObjectLike } from 'lodash';
import { _px } from '../../../../helpers/helper-functions';
import { makeBox } from '../../../copy-paste/utils';

const Tabs = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => changeConfig( blockName, x );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
			>
				<FontSizePicker
					fontSizes={
						[
							{
								name: __( 'Small', 'otter-blocks' ),
								slug: 'small',
								size: 14
							},
							{
								name: __( 'Normal', 'otter-blocks' ),
								slug: 'normal',
								size: 16
							},
							{
								name: __( 'Medium', 'otter-blocks' ),
								slug: 'medium',
								size: 20
							},
							{
								name: __( 'Large', 'otter-blocks' ),
								slug: 'large',
								size: 24
							},
							{
								name: __( 'XL', 'otter-blocks' ),
								slug: 'xl',
								size: 28
							}
						]
					}
					value={ attributes.titleFontSize }
					onChange={ titleFontSize => setAttributes({ titleFontSize }) }
				/>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Colors', 'otter-blocks' ) }
				initialOpen={ true }
				setAttributes={ setAttributes }
				colorSettings={ [
					{
						value: attributes.titleBackgroundColor,
						label: __( 'Title background', 'otter-blocks' ),
						onChange: titleBackgroundColor => setAttributes({ titleBackgroundColor })
					},
					{
						value: attributes.activeTitleBackgroundColor,
						label: __( 'Active title background', 'otter-blocks' ),
						onChange: activeTitleBackgroundColor => setAttributes({ activeTitleBackgroundColor })
					},
					{
						value: attributes.titleColor,
						label: __( 'Title color', 'otter-blocks' ),
						onChange: titleColor => setAttributes({ titleColor })
					},
					{
						value: attributes.activeTitleColor,
						label: __( 'Active title color', 'otter-blocks' ),
						onChange: activeTitleColor => setAttributes({ activeTitleColor })
					},
					{
						value: attributes.contentTextColor,
						label: __( 'Content text color', 'otter-blocks' ),
						onChange: contentTextColor => setAttributes({ contentTextColor })
					},
					{
						value: attributes.tabColor,
						label: __( 'Content background', 'otter-blocks' ),
						onChange: tabColor => setAttributes({ tabColor })
					},
					{
						value: attributes.borderColor,
						label: __( 'Border', 'otter-blocks' ),
						onChange: borderColor => setAttributes({ borderColor })
					},
					{
						value: attributes.activeBorderColor,
						label: __( 'Active border', 'otter-blocks' ),
						onChange: activeBorderColor => setAttributes({ activeBorderColor })
					}
				] }
			/>
			<PanelBody
				title={ __( 'Dimensions(Layout)', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<BoxControl
					label={ __( 'Title Padding', 'otter-blocks' ) }
					values={ attributes.titlePadding }
					onChange={ titlePadding => setAttributes({ titlePadding }) }
				/>
				<BoxControl
					label={ __( 'Content Padding', 'otter-blocks' ) }
					values={ attributes.contentPadding }
					onChange={ contentPadding => setAttributes({ contentPadding }) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Border Radius', 'otter-blocks' ) }
				initialOpen={ true }
			>
				{/*

								TODO: Temporary disabled until the first prototype.

								<BoxControl
									label={ __( 'Radius', 'otter-blocks' ) }
									values={ attributes.borderRadius }
									onChange={ borderRadius => setAttributes({ borderRadius }) }
									id="o-border-raduis-box"
								/> */}

				<BoxControl
					label={ __( 'Title Border Width', 'otter-blocks' ) }
					values={ attributes.titleBorderWidth }
					onChange={ titleBorderWidth => setAttributes({ titleBorderWidth }) }
				/>

				<BoxControl
					label={ __( 'Content Border Width', 'otter-blocks' ) }
					values={ attributes.borderWidth }
					onChange={ borderWidth => setAttributes({ borderWidth }) }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default Tabs;
