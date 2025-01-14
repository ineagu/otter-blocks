/**
 * External dependencies
 */
import {
	isObject,
	isUndefined,
	pickBy,
	debounce
} from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';


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
	useState,
	memo
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
import Layout, { PaginationPreview } from './components/layout/index.js';
import {
	_align,
	_px,
	boxValues,
	changeActiveStyle,
	getCustomPostTypeSlugs,
	hex2rgba
} from '../../helpers/helper-functions.js';
import {
	useDarkBackground,
	useResponsiveAttributes
} from '../../helpers/utility-hooks.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';
import { domReady } from '../../helpers/frontend-helper-functions';
import { styles } from './constants.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Custom hook to initialize the block
 */
const useBlockInit = (clientId, attributes) => {
	useEffect(() => {
		const unsubscribe = blockInit(clientId, defaultAttributes);
		return () => unsubscribe(attributes.id);
	}, [attributes.id, clientId]);
};

/**
 * Custom hook to fetch custom post type slugs
 */
const useFetchSlugs = (setSlugs, attributes, setAttributes) => {
	useEffect(() => {
		let isNew = false;
		if (undefined === attributes.id) {
			isNew = true;
		}

		const fetch = async () => {
			setSlugs(await getCustomPostTypeSlugs());

			if (isNew) {
				const classes = changeActiveStyle(attributes?.className, styles, 'boxed');
				setAttributes({ className: classes });
			}
		};
		fetch();
	}, [attributes, setSlugs, setAttributes]);
};

/**
 * Custom hook to set post slugs in the store
 */
const useSetPostSlugs = (slugs) => {
	useEffect(() => {
		dispatch('otter-store').setPostsSlugs(slugs);
	}, [slugs]);
};

/**
 * Custom hook to handle dark background
 */
const useHandleDarkBackground = (attributes, setAttributes) => {
	useDarkBackground(attributes.backgroundColor, attributes, setAttributes);
};

/**
 * Custom hook to get posts
 */
const useGetPosts = (attributes) => {
	return useSelect((select) => {
		const catIds = attributes.categories && 0 < attributes.categories.length ? attributes.categories.map((cat) => cat.id) : [];

		const latestPostsQuery = pickBy({
			categories: catIds,
			order: attributes.order,
			orderby: attributes.orderBy,
			per_page: attributes.postsToShow,
			offset: attributes.offset,
			context: 'view'
		}, (value) => !isUndefined(value));

		const getPosts = (postType) => {
			if (postType === 'product') {
				const { COLLECTIONS_STORE_KEY } = window?.wc?.wcBlocksData;

				if (!COLLECTIONS_STORE_KEY) {
					return {
						posts: [],
						isLoading: false
					};
				}

				latestPostsQuery.category = catIds.join(',');

				const error = select(COLLECTIONS_STORE_KEY).getCollectionError('/wc/store', 'products', latestPostsQuery);

				if (error) {
					return {
						posts: [],
						isLoading: false
					};
				}

				const products = select(COLLECTIONS_STORE_KEY).getCollection('/wc/store', 'products', latestPostsQuery) ?? [];
				const isLoadingProducts = select(COLLECTIONS_STORE_KEY).isResolving('/wc/store', 'products', latestPostsQuery);

				if (isLoadingProducts) {
					return {
						posts: [],
						isLoading: true
					};
				}

				const productIds = products.map(({ id }) => id);

				return {
					posts: select('core').getEntityRecords('postType', postType, { include: productIds }) ?? [],
					isLoading: select('core').isResolving('getEntityRecords', ['postType', postType, { include: productIds }])
				};
			}

			return {
				posts: select('core').getEntityRecords('postType', postType, latestPostsQuery),
				isLoading: select('core').isResolving('getEntityRecords', ['postType', postType, latestPostsQuery])
			};
		};

		let posts = [];
		let isLoading = false;

		const postTypeSlugs = attributes.postTypes;

		if (0 < postTypeSlugs.length) {
			const { posts: loadedPosts, isLoading: loadingCheck } = postTypeSlugs.reduce((acc, slug) => {
				const { posts, isLoading } = getPosts(slug);

				return {
					posts: [
						...acc.posts,
						...(posts ?? [])
					],
					isLoading: acc.isLoading || isLoading
				};
			}, { posts: [], isLoading: false });

			posts = loadedPosts;
			isLoading = loadingCheck;
		} else {
			posts = select('core').getEntityRecords('postType', 'post', latestPostsQuery);
			isLoading = select('core').isResolving('getEntityRecords', ['postType', 'post', latestPostsQuery]);
		}

		if (attributes.featuredPostOrder && 0 < posts?.length) {
			posts = [
				...(posts?.filter(({ sticky }) => Boolean(sticky)) ?? []),
				...(posts?.filter(({ sticky }) => !Boolean(sticky)) ?? [])
			];
		}

		posts = posts?.filter(Boolean) ?? [];

		const taxonomies = select('core')?.getTaxonomies()
			?.map(({ slug }) => slug)
			?.filter((slug) => postTypeSlugs.some(postTypeSlug => slug === `${postTypeSlug}_cat`)) ?? [];

		if (0 === taxonomies.length) {
			taxonomies.push('category');
		}

		const categoriesList = taxonomies
			.map(taxonomy => select('core').getEntityRecords('taxonomy', taxonomy, { per_page: -1 }) ?? [])
			.flat();

		if (window?.rankMathEditor) {
			debounce(() => {
				window?.rankMathEditor.refresh('content');
			}, 500);
		}

		return {
			posts,
			categoriesList,
			authors: select('core').getUsers({ who: 'authors', context: 'view' }),
			isLoading
		};
	}, [attributes.categories, attributes.order, attributes.orderBy, attributes.postsToShow, attributes.offset, attributes.postTypes, attributes.featuredPostOrder]);
};

/**
 * Posts component
 * @param {import('./types').PostProps} param0
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useBlockInit(clientId, attributes);

	const [slugs, setSlugs] = useState([]);

	const { posts, categoriesList, authors, isLoading } = useGetPosts(attributes);

	const { responsiveGetAttributes } = useResponsiveAttributes();

	useFetchSlugs(setSlugs, attributes, setAttributes);
	useSetPostSlugs(slugs);
	useHandleDarkBackground(attributes, setAttributes);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const imageBoxShadow = getValue('imageBoxShadow');
	const boxShadow = getValue('boxShadow');

	const inlineStyles = {
		'--img-border-radius': isObject(attributes.borderRadius) ? boxValues(attributes.borderRadius) : _px(attributes.borderRadius),
		'--img-box-shadow': imageBoxShadow.active && `${imageBoxShadow.horizontal}px ${imageBoxShadow.vertical}px ${imageBoxShadow.blur}px ${imageBoxShadow.spread}px ${hex2rgba(imageBoxShadow.color, imageBoxShadow.colorOpacity)}`,
		'--image-ratio': attributes.imageRatio,
		'--border-width': _px(attributes.borderWidth),
		'--border-radius': boxValues(attributes.cardBorderRadius),
		'--border-radius-start-start': _px(attributes.cardBorderRadius?.top),
		'--border-radius-start-end': _px(attributes.cardBorderRadius?.right),
		'--border-radius-end-start': _px(attributes.cardBorderRadius?.bottom),
		'--border-radius-end-end': _px(attributes.cardBorderRadius?.left),
		'--box-shadow': boxShadow.active && `${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${hex2rgba(boxShadow.color, boxShadow.colorOpacity)}`,
		'--vert-align': _align(attributes.verticalAlign),
		'--text-align': attributes.textAlign,
		'--text-color': attributes.textColor,
		'--background-color': attributes.backgroundColor,
		'--background-overlay': attributes.backgroundOverlay || '#0000005e',
		'--border-color': attributes.borderColor,
		'--content-gap': attributes.contentGap,
		'--img-width': responsiveGetAttributes([_px(attributes.imageWidth), attributes.imageWidthTablet, attributes.imageWidthMobile]),
		'--img-width-tablet': attributes.imageWidthTablet,
		'--img-width-mobile': attributes.imageWidthMobile,
		'--title-text-size': responsiveGetAttributes([_px(attributes.customTitleFontSize), _px(attributes.customTitleFontSizeTablet), _px(attributes.customTitleFontSizeTablet)]),
		'--title-text-size-tablet': _px(attributes.customTitleFontSizeTablet),
		'--title-text-size-mobile': _px(attributes.customTitleFontSizeMobile),
		'--description-text-size': responsiveGetAttributes([_px(attributes.customDescriptionFontSize), _px(attributes.customDescriptionFontSizeTablet), _px(attributes.customDescriptionFontSizeMobile)]),
		'--description-text-size-tablet': _px(attributes.customDescriptionFontSizeTablet),
		'--description-text-size-mobile': _px(attributes.customDescriptionFontSizeMobile),
		'--meta-text-size': responsiveGetAttributes([attributes.customMetaFontSize, attributes.customMetaFontSizeTablet, attributes.customMetaFontSizeMobile]),
		'--meta-text-size-tablet': attributes.customMetaFontSizeTablet,
		'--meta-text-size-mobile': attributes.customMetaFontSizeMobile,
		'--column-gap': responsiveGetAttributes([attributes.columnGap, attributes.columnGapTablet, attributes.columnGapMobile]),
		'--column-gap-tablet': attributes.columnGapTablet,
		'--column-gap-mobile': attributes.columnGapMobile,
		'--row-gap': responsiveGetAttributes([attributes.rowGap, attributes.rowGapTablet, attributes.rowGapMobile]),
		'--row-gap-tablet': attributes.rowGapTablet,
		'--row-gap-mobile': attributes.rowGapMobile,
		'--content-padding': responsiveGetAttributes([attributes.padding, attributes.paddingTablet, attributes.paddingMobile]),
		'--content-padding-tablet': attributes.paddingTablet,
		'--content-padding-mobile': attributes.paddingMobile,
		'--pag-color': attributes.pagColor,
		'--pag-bg-color': attributes.pagBgColor,
		'--pag-color-hover': attributes.pagColorHover,
		'--pag-bg-color-hover': attributes.pagBgColorHover,
		'--pag-color-active': attributes.pagColorActive,
		'--pag-bg-color-active': attributes.pagBgColorActive,
		'--pag-border-color': attributes.pagBorderColor,
		'--pag-border-color-hover': attributes.pagBorderColorHover,
		'--pag-border-color-active': attributes.pagBorderColorActive,
		'--pag-border-radius': boxValues(attributes.pagBorderRadius),
		'--pag-border-width': boxValues(attributes.pagBorderWidth),
		'--pag-padding': boxValues(attributes.pagPadding, { top: '5px', right: '15px', bottom: '5px', left: '15px' }),
		'--pag-gap': attributes.pagGap,
		'--pag-size': attributes.pagSize,
		'--pag-cont-margin': boxValues(attributes.pagContMargin, { top: '10px', bottom: '30px' })
	};

	const blockProps = useBlockProps();

	const Preview = memo(({
		posts,
		categoriesList,
		authors,
		blockProps,
		inlineStyles,
		attributes
	}) => {
		if (!posts || !categoriesList || !authors || isLoading) {
			return (
				<div {...blockProps}>
					<Placeholder>
						<Spinner />
						{__('Loading Posts', 'otter-blocks')}
					</Placeholder>
				</div>
			);
		}

		if (0 === posts.length) {
			return (
				<div {...blockProps}>
					<Placeholder>
						{__('No Posts', 'otter-blocks')}
					</Placeholder>
				</div>
			);
		}

		return (
			<div {...blockProps} style={inlineStyles}>
				<Disabled>
					{attributes.enableFeaturedPost && (
						<FeaturedPost
							attributes={attributes}
							post={posts?.[0]}
							categoriesList={categoriesList}
							author={authors[0]}
						/>
					)}

					<Layout
						attributes={attributes}
						posts={posts}
						categoriesList={categoriesList}
						authors={authors}
					/>

				</Disabled>
				{attributes.hasPagination && <PaginationPreview />}
			</div>
		);
	});

	return (
		<Fragment>
			{categoriesList && (
				<Inspector
					attributes={attributes}
					setAttributes={setAttributes}
					categoriesList={categoriesList}
					isLoading={isLoading}
				/>
			)}

			<Controls
				attributes={attributes}
				setAttributes={setAttributes}
			/>

			<Preview
				posts={posts}
				categoriesList={categoriesList}
				authors={authors}
				blockProps={blockProps}
				inlineStyles={inlineStyles}
				attributes={attributes}
			/>
		</Fragment>
	);
};

domReady(() => {
	let maxTries = 10;

	const init = () => {
		window.wp.hooks.addFilter('rank_math_content', 'rank-math', (content) => {
			const postsHtml = document.querySelectorAll('.o-posts-grid-post-body');
			return (content ?? '') + (Array.from(postsHtml)?.map((post) => post.innerHTML)?.join('') ?? '');
		});

		window?.rankMathEditor?.refresh('content');
	};

	const t = setInterval(() => {
		if (window?.rankMathEditor) {
			clearInterval(t);
			init();
		} else {
			maxTries--;
			if (0 === maxTries) {
				clearInterval(t);
			}
		}
	}, 1000);
});

export default memo(Edit);
