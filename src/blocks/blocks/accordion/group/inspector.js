/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	FontSizePicker,
	ToggleControl,
	Placeholder,
	Spinner,
	__experimentalBoxControl as BoxControl,
	__experimentalBorderBoxControl as BorderBoxControl
} from '@wordpress/components';

import { Suspense, lazy } from '@wordpress/element';


import { select, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import SyncControl from '../../../components/sync-control/index.js';
import GoogleFontsControl from '../../../components/google-fonts-control';
import ClearButton from '../../../components/clear-button';
import BoxShadowControl from '../../../components/box-shadow-control';

const IconPickerControl = lazy( () => import( '../../../components/icon-picker-control/index.js' ) );

/**
 *
 * @param {import('./types.js').AccordionGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	clientId,
	attributes,
	setAttributes,
	getValue
}) => {
	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const changeBoxShadow = data => {
		const boxShadow = { ...attributes.boxShadow };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ boxShadow });
	};

	const onAlwaysOpenToggle = alwaysOpen => {
		setAttributes({ alwaysOpen });

		if ( true === alwaysOpen ) {
			return;
		}

		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { initialOpen: false });
		});
	};

	const onTagChange = ( targetTag ) => {
		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { tag: targetTag });
		});

		setAttributes({ tag: targetTag });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<ToggleControl
					label={ __( 'Place icon before text', 'otter-blocks' ) }
					checked={ attributes.iconFirst }
					onChange={ iconFirst => setAttributes({ iconFirst }) }
				/>
				<ToggleControl
					label={ __( 'Keep multiple items expanded', 'otter-blocks' ) }
					help={ __( 'When enabled, multiple accordion items can be expanded at the same time', 'otter-blocks' ) }
					checked={ attributes.alwaysOpen }
					onChange={ onAlwaysOpenToggle }
				/>
				<SelectControl
					label={ __( 'Title HTML tag', 'otter-blocks' ) }
					value={ attributes.tag }
					options={ [
						{ label: __( 'Heading 1', 'otter-blocks' ), value: 'h1' },
						{ label: __( 'Heading 2', 'otter-blocks' ), value: 'h2' },
						{ label: __( 'Heading 3', 'otter-blocks' ), value: 'h3' },
						{ label: __( 'Heading 4', 'otter-blocks' ), value: 'h4' },
						{ label: __( 'Heading 5', 'otter-blocks' ), value: 'h5' },
						{ label: __( 'Heading 6', 'otter-blocks' ), value: 'h6' },
						{ label: __( 'Division', 'otter-blocks' ), value: 'div' }
					] }
					onChange={ onTagChange }
				/>
				<SelectControl
					label={ __( 'Gap', 'otter-blocks' ) }
					value={ attributes.gap }
					options={ [
						{ label: __( 'No Gap', 'otter-blocks' ), value: '' },
						{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
						{ label: __( 'Wide (10px)', 'otter-blocks' ), value: 'wide' },
						{ label: __( 'Wider (20px)', 'otter-blocks' ), value: 'wider' }
					] }
					onChange={ e => setAttributes({ gap: e }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Spacing', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<BoxControl
					label={ __( 'Header Padding', 'otter-blocks' ) }
					values={ attributes.headerPadding }
					onChange={ headerPadding => setAttributes({ headerPadding }) }
				/>
				<BoxControl
					label={ __( 'Content Padding', 'otter-blocks' ) }
					values={ attributes.contentPadding }
					onChange={ contentPadding => setAttributes({ contentPadding }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Styling', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<Suspense fallback={<Placeholder><Spinner/></Placeholder>}>
					<IconPickerControl
						label={ __( 'Icon', 'otter-blocks' ) }
						library="fontawesome"
						prefix={ attributes.icon.prefix }
						icon={ attributes.icon.name }
						allowThemeisleIcons={ false }
						onChange={ icon => setAttributes({ icon }) }
					/>
				</Suspense>
				<BorderBoxControl
					label={ __( 'Header Borders', 'otter-blocks' ) }
					value={ attributes.headerBorder }
					onChange={ headerBorder => setAttributes({ headerBorder }) }
				/>
				<BorderBoxControl
					label={ __( 'Content Borders', 'otter-blocks' ) }
					value={ attributes.contentBorder }
					onChange={ contentBorder => setAttributes({ contentBorder }) }
				/>

				<SyncControl
					field="titleColor"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Title', 'otter-blocks' ) }
						colorValue={ attributes.titleColor }
						onColorChange={ e => setAttributes({ titleColor: e }) }
					/>
				</SyncControl>

				<SyncControl
					field="titleBackground"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Title Background', 'otter-blocks' ) }
						colorValue={ attributes.titleBackground }
						onColorChange={ e => setAttributes({ titleBackground: e }) }
					/>
				</SyncControl>

				<ContrastChecker
					{ ...{
						textColor: getValue( 'titleColor' ),
						backgroundColor: getValue( 'titleBackground' )
					} }
				/>

				<SyncControl
					field="contentBackground"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Content Background', 'otter-blocks' ) }
						colorValue={ attributes.contentBackground }
						onColorChange={ e => setAttributes({ contentBackground: e }) }
					/>
				</SyncControl>

				<BoxShadowControl
					boxShadow={ attributes.boxShadow }
					onChange={ changeBoxShadow }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Active Item Styling', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<Suspense fallback={<Placeholder><Spinner/></Placeholder>}>
					<IconPickerControl
						label={ __( 'Open Tab Icon', 'otter-blocks' ) }
						library="fontawesome"
						prefix={ attributes.openItemIcon.prefix }
						icon={ attributes.openItemIcon.name }
						allowThemeisleIcons={ false }
						onChange={ openItemIcon => setAttributes({ openItemIcon }) }
					/>
				</Suspense>
				<ColorGradientControl
					label={ __( 'Title', 'otter-blocks' ) }
					colorValue={ attributes.activeTitleColor }
					onColorChange={ activeTitleColor => setAttributes({ activeTitleColor }) }
				/>

				<ColorGradientControl
					label={ __( 'Title Background', 'otter-blocks' ) }
					colorValue={ attributes.activeTitleBackground }
					onColorChange={ activeTitleBackground => setAttributes({ activeTitleBackground }) }
				/>

				<ContrastChecker
					{ ...{
						textColor: getValue( 'activeTitleColor' ),
						backgroundColor: getValue( 'activeTitleBackground' )
					} }
				/>

				<ColorGradientControl
					label={ __( 'Content Background', 'otter-blocks' ) }
					colorValue={ attributes.activeContentBackground }
					onColorChange={ activeContentBackground => setAttributes({ activeContentBackground }) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Title Typography', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<FontSizePicker
					value={ attributes.fontSize }
					fontSizes={ [
						{
							name: __( 'Small', 'otter-blocks' ),
							slug: 'small',
							size: 17
						},
						{
							name: __( 'Medium', 'otter-blocks' ),
							slug: 'medium',
							size: 22
						},
						{
							name: __( 'Large', 'otter-blocks' ),
							slug: 'large',
							size: 36
						},
						{
							name: __( 'Extra Large', 'otter-blocks' ),
							slug: 'extra-large',
							size: 42
						}
					] }
					onChange={ fontSize => setAttributes({ fontSize }) }
				/>

				<GoogleFontsControl
					label={ __( 'Font Family', 'otter-blocks' ) }
					value={ attributes.fontFamily }
					onChangeFontFamily={ changeFontFamily }
					valueVariant={ attributes.fontVariant }
					onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
					valueStyle={ attributes.fontStyle }
					onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
					valueTransform={ attributes.textTransform }
					onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
				/>

				<ClearButton
					values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform' ]}
					setAttributes={ setAttributes }
				/>

				<RangeControl
					label={ __( 'Letter Spacing', 'otter-blocks' ) }
					value={ attributes.letterSpacing }
					onChange={ letterSpacing => setAttributes({ letterSpacing }) }
					min={ -50 }
					max={ 100 }
					allowReset={ true }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
