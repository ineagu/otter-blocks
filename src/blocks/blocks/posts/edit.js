/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isObject,
	isUndefined,
	pickBy
} from 'lodash';

import {
	Disabled,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useBlockProps } from '@wordpress/block-editor';

import {
	useSelect,
	dispatch
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import {
	_align,
	_px,
	boxValues,
	getCustomPostTypeSlugs,
	hex2rgba
} from '../../helpers/helper-functions.js';
import {
	useDarkBackground,
	useResponsiveAttributes
} from '../../helpers/utility-hooks.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Posts component
 * @param {import('./types').PostProps} param0
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ slugs, setSlugs ] = useState([]);
	const [ isLoading, toggleLoading ] = useState( true );
	let autoStopLoadingTimeout;

	const {
		posts,
		categoriesList,
		authors
	} = useSelect( select => {
		const catIds = attributes.categories && 0 < attributes.categories.length ? attributes.categories.map( ( cat ) => cat.id ) : [];

		const latestPostsQuery = pickBy({
			categories: catIds,
			order: attributes.order,
			orderby: attributes.orderBy,
			per_page: attributes.postsToShow, // eslint-disable-line camelcase
			offset: attributes.offset,
			context: 'view'
		}, ( value ) => ! isUndefined( value ) );

		const postTypeSlugs = attributes.postTypes;
		let posts = ( 0 < postTypeSlugs.length ) ? (
			postTypeSlugs.map( slug => select( 'core' ).getEntityRecords( 'postType', slug, latestPostsQuery ) ).flat()
		) : select( 'core' ).getEntityRecords( 'postType', 'post', latestPostsQuery );

		if ( attributes.featuredPostOrder && 0 < posts?.length ) {
			posts = [
				...( posts?.filter( ({ sticky }) => Boolean( sticky ) ) ?? []),
				...( posts?.filter( ({ sticky }) => ! Boolean( sticky ) ) ?? [])
			];
		}

		posts = posts.filter( Boolean );

		const taxonomies = select( 'core' )?.getTaxonomies()
			?.map( ({ slug }) => slug )
			?.filter( ( slug ) => postTypeSlugs.some( postTypeSlug => slug === `${postTypeSlug}_cat` ) ) ?? [];

		if ( 0 === taxonomies.length ) {
			taxonomies.push( 'category' );
		}

		const categoriesList = taxonomies
			// eslint-disable-next-line camelcase
			.map( taxonomy => select( 'core' ).getEntityRecords( 'taxonomy', taxonomy, { per_page: -1 }) ?? [])
			.flat();

		return {
			posts,
			categoriesList: categoriesList,
			authors: select( 'core' ).getUsers({ who: 'authors', context: 'view' })
		};
	}, [ attributes.categories, attributes.order, attributes.orderBy, attributes.postsToShow, attributes.offset, attributes.postTypes, attributes.featuredPostOrder, isLoading ]);

	const { responsiveGetAttributes } = useResponsiveAttributes();

	useEffect( () => {
		const fetch = async() => {
			setSlugs( await getCustomPostTypeSlugs() );
		};
		fetch();
	}, []);

	useEffect( () => {
		dispatch( 'otter-store' ).setPostsSlugs( slugs );
	}, [ slugs ]);

	useEffect( () => {

		/**
		 * Stop loading message after 5 seconds if no posts are found.
		 * When switching between post types for first time we need to wait for the posts to load.
		 * Since the hook for getting posts has no status we do not know when it is done,
		 * because when it is loading is returning `[]` and we can not know if it did not find any posts, or it is still loading.
		 */
		if ( autoStopLoadingTimeout && 0 < posts?.length ) {
			clearTimeout( autoStopLoadingTimeout );
		} else if ( ! autoStopLoadingTimeout && isLoading ) {
			autoStopLoadingTimeout = setTimeout( () => toggleLoading( false ), 5000 );
		}

	}, [ isLoading, posts ]);

	useDarkBackground( attributes.backgroundColor, attributes, setAttributes );

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const imageBoxShadow = getValue( 'imageBoxShadow' );
	const boxShadow = getValue( 'boxShadow' );

	const inlineStyles = {
		'--img-border-radius': isObject( attributes.borderRadius ) ? boxValues( attributes.borderRadius ) : _px( attributes.borderRadius ),
		'--img-box-shadow': imageBoxShadow.active && `${ imageBoxShadow.horizontal }px ${ imageBoxShadow.vertical }px ${ imageBoxShadow.blur }px ${ imageBoxShadow.spread }px ${ hex2rgba( imageBoxShadow.color, imageBoxShadow.colorOpacity ) }`,
		'--border-width': _px( attributes.borderWidth ),
		'--border-radius': boxValues( attributes.cardBorderRadius ),
		'--box-shadow': boxShadow.active && `${ boxShadow.horizontal }px ${ boxShadow.vertical }px ${ boxShadow.blur }px ${ boxShadow.spread }px ${ hex2rgba( boxShadow.color, boxShadow.colorOpacity ) }`,
		'--vert-align': _align( attributes.verticalAlign ),
		'--text-align': attributes.textAlign,
		'--text-color': attributes.textColor,
		'--background-color': attributes.backgroundColor,
		'--border-color': attributes.borderColor,
		'--content-gap': attributes.contentGap,
		'--img-width': responsiveGetAttributes([ _px( attributes.imageWidth ), attributes.imageWidthTablet, attributes.imageWidthMobile ]),
		'--img-width-tablet': attributes.imageWidthTablet,
		'--img-width-mobile': attributes.imageWidthMobile,
		'--title-text-size': responsiveGetAttributes([ _px( attributes.customTitleFontSize ), _px( attributes.customTitleFontSizeTablet ), _px( attributes.customTitleFontSizeTablet ) ]),
		'--title-text-size-tablet': _px( attributes.customTitleFontSizeTablet ),
		'--title-text-size-mobile': _px( attributes.customTitleFontSizeMobile ),
		'--description-text-size': responsiveGetAttributes([ _px( attributes.customDescriptionFontSize ), _px( attributes.customDescriptionFontSizeTablet ), _px( attributes.customDescriptionFontSizeMobile ) ]),
		'--description-text-size-tablet': _px( attributes.customDescriptionFontSizeTablet ),
		'--description-text-size-mobile': _px( attributes.customDescriptionFontSizeMobile ),
		'--meta-text-size': responsiveGetAttributes([ attributes.customMetaFontSize, attributes.customMetaFontSizeTablet, attributes.customMetaFontSizeMobile ]),
		'--meta-text-size-tablet': attributes.customMetaFontSizeTablet,
		'--meta-text-size-mobile': attributes.customMetaFontSizeMobile,
		'--column-gap': responsiveGetAttributes([ attributes.columnGap, attributes.columnGapTablet, attributes.columnGapMobile ]),
		'--column-gap-tablet': attributes.columnGapTablet,
		'--column-gap-mobile': attributes.columnGapMobile,
		'--row-gap': responsiveGetAttributes([ attributes.rowGap, attributes.rowGapTablet, attributes.rowGapMobile ]),
		'--row-gap-tablet': attributes.rowGapTablet,
		'--row-gap-mobile': attributes.rowGapMobile,
		'--content-padding': responsiveGetAttributes([ attributes.padding, attributes.paddingTablet, attributes.paddingMobile ]),
		'--content-padding-tablet': attributes.paddingTablet,
		'--content-padding-mobile': attributes.paddingMobile
	};

	const blockProps = useBlockProps();

	const Preview = ({
		posts,
		categoriesList,
		authors,
		blockProps,
		inlineStyles,
		attributes
	}) => {
		if ( ! posts || ! categoriesList || ! authors || isLoading ) {
			return (
				<div { ...blockProps }>
					<Placeholder>
						<Spinner />
						{ __( 'Loading Posts', 'otter-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		if ( 0 === posts.length ) {
			return (
				<div { ...blockProps }>
					<Placeholder>
						{ 0 < attributes.categories?.length ? __( 'No Post match the selected categories. Please revise the Categories in block settings.', 'otter-blocks' ) :  __( 'No Posts that match the Post Type. Please revise in Layout tab in block settings.', 'otter-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		return (
			<div { ...blockProps } style={ inlineStyles }>
				<Disabled>
					{ attributes.enableFeaturedPost && (
						<FeaturedPost
							attributes={ attributes }
							post={ posts?.[0] }
							category={ categoriesList[0] }
							categoriesList={ categoriesList }
							author={ authors[0] }
						/>
					) }

					<Layout
						attributes={ attributes }
						posts={ posts }
						categoriesList={ categoriesList }
						authors={ authors }
					/>
				</Disabled>
			</div>
		);
	};

	return (
		<Fragment>
			{ categoriesList && (
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					categoriesList={ categoriesList }
					toggleLoading={ toggleLoading }
				/>
			) }

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Preview
				posts={ posts }
				categoriesList={ categoriesList }
				authors={ authors }
				blockProps={ blockProps }
				inlineStyles={ inlineStyles }
				attributes={ attributes }
			/>
		</Fragment>
	);
};

export default Edit;
