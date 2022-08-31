/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitContol
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Notice from '../../components/notice/index.js';
import { useSelect, dispatch } from '@wordpress/data';

const FILTER_OPTIONS = {
	position: 'o-sticky-pos',
	offset: 'o-sticky-offset',
	scope: 'o-sticky-scope',
	behaviour: 'o-sticky-bhvr',
	usage: 'o-sticky-use',
	float: 'o-sticky-float',
	width: 'o-sticky-width',
	side: 'o-sticky-side',
	sideOffset: 'o-sticky-opt-side-offset'
};

const ProFeatures = () => {
	return (
		<Fragment>
			<SelectControl
				label={ __( 'Position', 'otter-blocks' ) }
				help={ __( 'Position of the block in relation to the screen.', 'otter-blocks' ) }
				value="o-sticky-pos-top"
				options={ [
					{
						label: __( 'Top', 'otter-blocks' ),
						value: 'o-sticky-pos-top'
					},
					{
						label: __( 'Bottom (Pro)', 'otter-blocks' ),
						value: 'o-sticky-pos-bottom',
						disabled: true
					}
				] }
				onChange={ () => {} }
			/>

			<RangeControl
				label={ __( 'Offset', 'otter-blocks' ) }
				help={ __( 'Distance from the block to the screen.', 'otter-blocks' ) }
				disabled={ true }
				value={ 0 }
				min={ 0 }
				max={ 500 }
				onChange={ () => {} }
			/>

			<SelectControl
				label={ __( 'Behaviour', 'otter-blocks' ) }
				help={ __( 'Behaviour when multiple sticky blocks with the same movement limit collide.', 'otter-blocks' ) }
				value="o-sticky-bhvr-keep"
				options={ [
					{
						label: __( 'Collapse', 'otter-blocks' ),
						value: 'o-sticky-bhvr-keep'
					},
					{
						label: __( 'Fade (Pro)', 'otter-blocks' ),
						value: 'o-sticky-bhvr-hide',
						disabled: true
					},
					{
						label: __( 'Stack (Pro)', 'otter-blocks' ),
						value: 'o-sticky-bhvr-stack',
						disabled: true
					}
				] }
				onChange={ () => {} }
			/>

			<ToggleControl
				label={ __( 'Enable on Mobile', 'otter-blocks' ) }
				help={ __( 'Make the sticky mode active for mobile users.' ) }
				disabled={ true }
				checked={ false }
				onChange={ () => {} }
			/>

			{ ! Boolean( window.themeisleGutenberg.hasPro ) && (
				<Notice
					notice={ <ExternalLink href={ window.themeisleGutenberg.upgradeLink }>{ __( 'Get more options with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
					variant="upsell"
				/>
			) }
		</Fragment>
	);
};

const AlwaysActiveOption = ({ attributes, clientId, addOption, removeOption, removeOptions }) => {
	const { isRootBlock, activeFloatBlocks } = useSelect( select => {
		console.count( 'Always on top test' ); // TODO: remove after review.
		const { getBlocks } = select( 'core/block-editor' );
		const pageBlocks = getBlocks();

		return {
			isRootBlock: pageBlocks?.some( block => block.clientId === clientId ) ?? false,
			activeFloatBlocks: pageBlocks?.filter( block => block.clientId !== clientId && block?.attributes?.className?.includes( FILTER_OPTIONS.float ) ) ?? []
		};
	}, []);

	const isActive = attributes?.className?.includes( FILTER_OPTIONS.float );

	const [ width, setWidth ] = useState( attributes?.className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.width ) )?.split( '-' )?.pop() );
	const [ offset, setOffset ] = useState( attributes?.className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.sideOffset ) )?.split( '-' )?.pop() );

	useEffect( () => {
		console.log( width, offset );
		if ( attributes?.className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.width ) )?.split( '-' )?.pop() !== width ) {
			if ( width?.startsWith( '0' ) ) {
				removeOption( FILTER_OPTIONS.width );
			} else {
				addOption( `o-sticky-width-${width}`, FILTER_OPTIONS.width );
			}
		}
		if ( attributes?.className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.sideOffset ) )?.split( '-' )?.pop() !== offset ) {
			if ( offset?.startsWith( '0' ) ) {
				removeOption( FILTER_OPTIONS.offset );
			} else {
				addOption( `o-sticky-opt-side-offset-${offset}`, FILTER_OPTIONS.offset );
			}
		}
	}, [ width, offset ]);

	return (
		<div>

			<Fragment>
				<ToggleControl
					label={ __( 'Float Mode', 'otter-blocks' ) }
					help={ __( 'Make the block to float. This is available only for root blocks.', 'otter-blocks' ) }
					checked={ isActive  }
					onChange={ ( value ) => {
						console.log( activeFloatBlocks, value ); // TODO: remove after review
						if ( value && 0 === activeFloatBlocks.length ) {
							addOption( FILTER_OPTIONS.float, FILTER_OPTIONS.float ); // you can activate only if no other block is active
						} else if ( false === value ) {
							removeOptions([ FILTER_OPTIONS.float, FILTER_OPTIONS.width, FILTER_OPTIONS.offset ]);
						}
					} }
					disabled={ ( 0 < activeFloatBlocks.length || ! isRootBlock ) && ! isActive }
				/>

				{
					0 < activeFloatBlocks?.length && (
						<Fragment>
							<p>
								{ __( 'Only one block can be in float mode.', 'otter-blocks' )}
							</p>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '10px',
									alignItems: 'flex-start'
								}}
							>
								{
									activeFloatBlocks.map( ( activeBlock, idx ) => {
										return (
											<Button
												key={ idx }
												variant='secondary'
												onClick={ () => {
													dispatch( 'core/block-editor' ).selectBlock( activeBlock.clientId );
												}}
											>{ 1 === activeFloatBlocks?.length ? __( 'Go to current active float block', 'otter-blocks' ) : `${__( 'Go to the active float block', 'otter-blocks' )} (${idx})` }</Button>
										);
									})
								}
							</div>

						</Fragment>

					)
				}
				{
					isActive && (
						<Fragment>
							<p>
								{ __( 'The block is now in a floating state. Set the desired width. Please check the result in Preview.', 'otter-blocks' )}
							</p>
							<UnitContol
								label={ __( 'Width', 'otter-blocks' ) }
								value={ width ?? '500px' }
								onChange={ setWidth }
							/>
							<SelectControl
								label={ __( 'Side to stick', 'otter-blocks' ) }
								value={ attributes?.className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.side ) ) ?? 'o-sticky-side-left' }
								options={[
									{
										label: __( 'Left', 'otter-blocks' ),
										value: 'o-sticky-side-left'
									},
									{
										label: __( 'Right', 'otter-blocks' ),
										value: 'o-sticky-side-right'
									}
								]}
								onChange={ value => {
									addOption( 'o-sticky-side-left' === value ? undefined : value, FILTER_OPTIONS.side );
								} }
							/>
							<UnitContol
								label={ __( 'Side Offset', 'otter-blocks' ) }
								value={ offset ?? '20px' }
								onChange={ setOffset }
							/>
						</Fragment>
					)
				}
			</Fragment>

		</div>
	);
};

const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	const [ containerOptions, setContainerOptions ] = useState([{
		label: __( 'Screen', 'otter-blocks' ),
		value: 'o-sticky-scope-screen'
	}]);

	/*
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';

	const addOptions = ( options, filtersOption ) => {

		const classes = new Set( attributes?.className?.split( ' ' )?.filter(
			c => ! filtersOption.some(
				f => c.includes( f )
			)
		) ?? []);

		for ( const option of options ) {
			if ( option ) {
				classes.add( option );
			}
		}
		setAttributes({ className: Array.from( classes ).filter( x => 'string' === typeof x  && x ).join( ' ' ) });
	};

	const addOption = ( option, filterOption = FILTER_OPTIONS.position ) => {
		addOptions([ option ], [ filterOption ]);
	};

	const removeOptions = ( optionsFilters ) => {
		addOptions([], optionsFilters );
	};

	const removeOption = ( optionFilter ) => {
		removeOptions([ optionFilter ]);
	};


	useEffect( () => {
		if ( clientId ) {
			console.count( 'Test Perf' ); // TODO: remove after review.
			const block = document.querySelector( `#block-${ clientId }` );
			if ( block ) {
				let parent = block?.parentElement;
				const containers = [];
				const options = [];
				while ( parent && ! parent.classList.contains( 'is-root-container' ) ) {
					if (
						(
							parent.classList.contains( 'wp-block-themeisle-blocks-advanced-column' ) ||
							parent.classList.contains( 'wp-block-group' ) ||
							parent.classList.contains( 'wp-block-column' )
						)
					) {
						containers.push( 'parent' );
					}

					if (
						(
							parent.classList.contains( 'wp-block-themeisle-blocks-advanced-columns' ) ||
							parent.classList.contains( 'wp-block-group' ) ||
							parent.classList.contains( 'wp-block-columns' )
						)
					) {
						containers.push( 'section' );
					}

					parent = parent.parentElement;
				}

				if ( containers.some( x => 'section' === x ) ) {
					options.push({
						label: __( 'Top Level Block', 'otter-blocks' ),
						value: 'o-sticky-scope-main-area'
					});

					if ( 1 < containers.filter( x => 'section' === x ) ) {
						options.push({
							label: __( 'Section', 'otter-blocks' ),
							value: 'o-sticky-scope-section'
						});
					}
				}

				if ( containers.some( x => 'parent' === x ) ) {
					options.push({
						label: __( 'Parent Block', 'otter-blocks' ),
						value: 'o-sticky-scope-parent'
					});
				}

				options.push({
					label: __( 'Screen', 'otter-blocks' ),
					value: 'o-sticky-scope-screen'
				});

				setContainerOptions( options );
			}
		}
	}, [ clientId ]);

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Sticky', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<p>{ __( 'Set any block as Sticky, so that it sticks to another element on the page.', 'otter-blocks' ) }</p>

				<ExternalLink
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.themeisle.com/article/1529-how-to-make-a-block-sticky"
				>
					{ __( 'Learn more about Sticky', 'otter-blocks' ) }
				</ExternalLink>

				<SelectControl
					label={ __( 'Sticky To', 'otter-blocks' ) }
					help={ __( 'Select the parent element for the sticky block.', 'otter-blocks' ) }
					value={ limit }
					options={ containerOptions }
					onChange={ value => addOption( value, FILTER_OPTIONS.scope ) }
				/>

				<AlwaysActiveOption attributes={ attributes} clientId={ clientId } addOption={ addOption } removeOptions={ removeOptions } removeOption={removeOption} />

				{ applyFilters( 'otter.sticky.controls', <ProFeatures />, attributes, FILTER_OPTIONS, addOption ) }

				{ applyFilters( 'otter.poweredBy', '' ) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Edit;
