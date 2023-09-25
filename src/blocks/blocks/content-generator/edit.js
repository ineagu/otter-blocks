/**
 * External dependencies
 */
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, Disabled, Dropdown, ResizableBox, SelectControl } from '@wordpress/components';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect, useMemo,
	useRef,
	useState
} from '@wordpress/element';

import { createBlock, rawHandler } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks } from '../../helpers/prompt';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { chevronDown, Icon } from '@wordpress/icons';
import { insertBlockBelow } from '../../helpers/block-utility';

const { attributes: defaultAttributes } = metadata;

function formatNameBlock( name ) {
	const namePart = name.split( '/' )[1];
	return namePart.split( ' ' ).map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) ).join( ' ' );
}

/**
 * AI Block
 * @param {import('./types').ContentGeneratorProps} props
 */
const ContentGenerator = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	toggleSelection,
	name
}) => {

	const blockProps = useBlockProps();

	const [ prompt, setPrompt ] = useState( '' );

	const {
		insertBlock,
		removeBlock,
		replaceInnerBlocks,
		selectBlock,
		moveBlockToPosition,
		insertBlocks,
		replaceBlock,
		replaceBlocks
	} = useDispatch( 'core/block-editor' );

	/**
	 * On success callback
	 *
	 * @type {import('../../components/prompt').PromptOnSuccess}
	 */
	const onPreview = ( result ) => {
		if ( 'form' === attributes.promptID ) {

			const formFields = parseFormPromptResponseToBlocks( result );

			const form = createBlock( 'themeisle-blocks/form', {}, formFields );

			replaceInnerBlocks( clientId, [ form ]);
		}

		if ( 'textTransformation' === attributes.promptID ) {
			const blocks = rawHandler({
				HTML: result
			});

			replaceInnerBlocks( clientId, blocks );
		}
	};

	const { hasInnerBlocks, containerId, getBlocks, getBlock, getBlockOrder, getBlockRootClientId } = useSelect(
		select => {

			const { getBlocks, getBlock, getBlockRootClientId, getBlockOrder } = select( 'core/block-editor' );

			const blocks = getBlocks?.( clientId ) ?? [];

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				containerId: blocks[0]?.clientId,
				getBlocks,
				getBlock,
				getBlockRootClientId,
				getBlockOrder
			};
		},
		[ clientId ]
	);

	/**
	 * Replace the block with the blocks generated from the prompt response
	 */
	const selfReplaceWithContent = () => {
		const blocks = getBlocks( clientId );

		replaceBlocks( clientId, blocks );
	};

	/**
	 * Insert the blocks generated from the prompt response below the current block
	 */
	const insertContentIntoPage = () => {
		const blocks = getBlocks( clientId );
		const copy = blocks.map( blockRoot => {
			return createBlock(
				blockRoot.name,
				blockRoot.attributes,
				blockRoot.innerBlocks?.map( block => {
					return createBlock( block.name, block.attributes, block.innerBlocks );
				})
			);
		});

		insertBlockBelow( clientId, copy );
	};

	const { blockType, defaultVariation, variations } = useSelect(
		select => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				variations: getBlockVariations( name, 'block' )
			};
		},
		[ name ]
	);

	const PRESETS = {
		form: {
			title: __( 'AI Form generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what form you need...', 'otter-blocks' ),
			actions: ( props ) => {
				return (
					<Fragment>
						<Button
							variant="primary"
							onClick={selfReplaceWithContent}
							disabled={'loading' === props.status}
						>
							{__( 'Replace', 'otter-blocks' )}
						</Button>
						<Button
							variant="secondary"
							onClick={insertContentIntoPage}
							disabled={'loading' === props.status}
						>
							{__( 'Insert below', 'otter-blocks' )}
						</Button>
					</Fragment>
				);
			}
		},
		textTransformation: {
			title: __( 'AI Content generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what content you need...', 'otter-blocks' ),
			actions: ( props ) => {
				return (
					<Fragment>
						<Button
							variant="primary"
							onClick={selfReplaceWithContent}
							disabled={'loading' === props.status}
						>
							{__( 'Replace', 'otter-blocks' )}
						</Button>
						<Button
							variant="secondary"
							onClick={insertContentIntoPage}
							disabled={'loading' === props.status}
						>
							{__( 'Insert below', 'otter-blocks' )}
						</Button>
					</Fragment>
				);
			}
		}
	};

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>

				{
					attributes.promptID === undefined ? (
						<VariationPicker
							icon={ get( blockType, [ 'icon', 'src' ]) }
							label={ get( blockType, [ 'title' ]) }
							variations={ variations }
							onSelect={ ( nextVariation = defaultVariation ) => {
								if ( nextVariation ) {
									setAttributes( nextVariation.attributes );
								}
								selectBlock( clientId );
							} }
						/>
					) : (
						<PromptPlaceholder
							promptID={attributes.promptID}
							title={PRESETS?.[attributes.promptID]?.title}
							value={prompt}
							onValueChange={setPrompt}
							onPreview={onPreview}
							actionButtons={PRESETS?.[attributes.promptID]?.actions}
							onClose={() => removeBlock( clientId )}
							promptPlaceholder={PRESETS?.[attributes.promptID]?.placeholder}
							resultHistory={attributes.resultHistory}
						>
							{
								hasInnerBlocks ? (
									<Disabled>
										<InnerBlocks renderAppender={false}/>
									</Disabled>
								) : ''
							}
						</PromptPlaceholder>
					)
				}
			</div>
		</Fragment>
	);
};

export default ContentGenerator;

// INFO: those are function for changing the content of an existing block.
// const [ showDropdown, setShowDropdown ] = useState( false );
// const [ containerClientId, setContainerClientId ] = useState( '' );
//
// const canReplaceBlock = useSelect( select => {
// 	const { getBlocks } = select( 'core/block-editor' );
//
// 	return ( getBlocks?.() ?? []).some( block => block.clientId === attributes.blockToReplace );
// }, [ clientId, attributes.blockToReplace ]);
//
// const replaceTargetBlock = () => {
//
// 	const blocksToAdd = getBlocks?.( containerId )?.map( block => {
// 		return createBlock( block.name, block.attributes, block.innerBlocks );
// 	}) ?? [];
//
// 	if ( ! blocksToAdd.length ) {
// 		return;
// 	}
//
// 	replaceInnerBlocks( attributes.blockToReplace, blocksToAdd );
// };
//
// const appendToTargetBlock = () => {
// 	const blocksToAdd = getBlocks?.( containerId )?.map( block => {
// 		return createBlock( block.name, block.attributes, block.innerBlocks );
// 	}) ?? [];
//
// 	const targetBlock = getBlock( attributes.blockToReplace );
//
// 	if ( ! blocksToAdd.length ) {
// 		return;
// 	}
//
// 	insertBlocks( blocksToAdd, targetBlock.innerBlocks?.length ?? 0, attributes.blockToReplace );
// };