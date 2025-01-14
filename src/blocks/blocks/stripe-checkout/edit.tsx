/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	Notice,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState,
	memo
} from '@wordpress/element';

import { useSelect , dispatch } from '@wordpress/data';

import { store } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import type { StripeCheckoutProps } from './types.d.ts';
import Inspector from './inspector';
import useSettings from '../../helpers/use-settings';

type Product = {
	id: string,
	name: string
};

type Price = {
	id: string,
	currency: string,
	unit_amount: number
};

/**
 * Custom hook to handle API key and product retrieval
 */
const useApiKeyAndProducts = (status, getOption, updateOption) => {
	const [canRetrieveProducts, setCanRetrieveProducts] = useState(false);
	const [apiKey, setAPIKey] = useState('');

	useEffect(() => {
		if (status === 'loaded') {
			const apiKey = getOption('themeisle_stripe_api_key');
			setCanRetrieveProducts(status === 'loaded' && apiKey?.length > 0);
		}
	}, [status, getOption]);

	const reset = () => {
		dispatch('themeisle-gutenberg/data').invalidateResolutionForStoreSelector('getStripeProducts');
		dispatch('themeisle-gutenberg/data').invalidateResolutionForStoreSelector('getStripeProductPrices');
		setCanRetrieveProducts(apiKey?.length > 0);
		setAPIKey('');
	};

	const saveApiKey = () => {
		setCanRetrieveProducts(false);
		updateOption('themeisle_stripe_api_key', apiKey?.replace?.(/\s/g, ''), __('Stripe API Key saved!', 'otter-blocks'), 'stripe-api-key', reset);
	};

	return {
		canRetrieveProducts,
		apiKey,
		setAPIKey,
		saveApiKey
	};
};

/**
 * Custom hook to handle product and price selection
 */
const useProductAndPriceSelection = (canRetrieveProducts, status, attributes) => {
	const { products, productsList, hasProductsRequestFailed, productsError, isLoadingProducts } = useSelect(select => {
		const { getStripeProducts, getResolutionError, isResolving } = select('themeisle-gutenberg/data');

		const products = getStripeProducts();

		return {
			products,
			productsList: products ? products.map((product: Product) => ({
				label: `${product?.name} (id:${product?.id})`,
				value: product?.id
			})) : [],
			hasProductsRequestFailed: Boolean(getResolutionError?.('getStripeProducts')),
			productsError: getResolutionError?.('getStripeProducts'),
			isLoadingProducts: isResolving?.('getStripeProducts')
		};
	}, [canRetrieveProducts, status]);

	const { prices, pricesList, hasPricesRequestFailed, pricesError, isLoadingPrices } = useSelect(select => {
		if (!canRetrieveProducts) {
			return {
				prices: [],
				pricesList: [],
				hasPricesRequestFailed: true,
				pricesError: null,
				isLoadingPrices: false
			};
		}

		const { getStripeProductPrices, getResolutionError, isResolving } = select('themeisle-gutenberg/data');

		const prices = attributes.product ? getStripeProductPrices?.(attributes.product) : [];

		return {
			prices,
			pricesList: prices ? prices.map((price: Price) => ({
				label: `${price?.currency} ${price?.unit_amount} (id:${price?.id})`,
				value: price?.id
			})) : [],
			hasPricesRequestFailed: Boolean(getResolutionError?.('getStripeProductPrices', [attributes.product])),
			pricesError: getResolutionError?.('getStripeProductPrices', [attributes.product]),
			isLoadingPrices: isResolving?.('getStripeProductPrices', [attributes.product])
		};
	}, [attributes.product, canRetrieveProducts]);

	return {
		products,
		productsList,
		hasProductsRequestFailed,
		productsError,
		isLoadingProducts,
		prices,
		pricesList,
		hasPricesRequestFailed,
		pricesError,
		isLoadingPrices
	};
};

/**
 * Custom hook to handle meta data
 */
const useMetaData = (products, prices, attributes) => {
	const [meta, setMeta] = useState<any>({});

	useEffect(() => {
		const product = products?.find((i: Product) => attributes.product === i.id);
		const price = prices?.find((i: Price) => attributes.price === i.id);

		let unitAmount;

		if (price?.unit_amount) {
			unitAmount = price?.unit_amount / 100;
			unitAmount = unitAmount.toLocaleString('en-US', { style: 'currency', currency: price?.currency });
		}

		setMeta({
			name: product?.name,
			price: unitAmount,
			description: product?.description,
			image: product?.images?.[0] || undefined
		});
	}, [products, prices, attributes.price]);

	return meta;
};

/**
 * Stripe Checkout component
 * @param props
 * @param props.attributes
 * @param props.setAttributes
 * @return
 */
const Edit = ({
	attributes,
	setAttributes
}: StripeCheckoutProps) => {
	const [getOption, updateOption, status] = useSettings();
	const { canRetrieveProducts, apiKey, setAPIKey, saveApiKey } = useApiKeyAndProducts(status, getOption, updateOption);
	const { products, productsList, hasProductsRequestFailed, productsError, isLoadingProducts, prices, pricesList, hasPricesRequestFailed, pricesError, isLoadingPrices } = useProductAndPriceSelection(canRetrieveProducts, status, attributes);
	const meta = useMetaData(products, prices, attributes);
	const [view, setView] = useState<string>('default');

	const showPlaceholder = (isLoadingProducts || isLoadingPrices || hasProductsRequestFailed || hasPricesRequestFailed || undefined === attributes.product || undefined === attributes.price || 'loaded' !== status || !canRetrieveProducts);

	const blockProps = useBlockProps({
		className: classnames({ 'is-placeholder': showPlaceholder })
	});

	if (showPlaceholder) {
		return (
			<div {...blockProps}>
				<Placeholder
					icon={store}
					label={__('Stripe Checkout', 'otter-blocks')}
				>
					{(status === 'loading' || status === 'saving') && (
						<div style={{ width: '100%' }}>
							<Spinner />
							{__('Checking the API Key…', 'otter-blocks')}
							<br /><br />
						</div>
					)}

					{((hasProductsRequestFailed || hasPricesRequestFailed) && status === 'loaded' && (productsError?.message?.length || pricesError?.message?.length)) && (
						<div style={{ width: '100%', marginLeft: '-15px', marginBottom: '10px' }}>
							<Notice
								status='error'
								isDismissible={false}
							>
								{(hasProductsRequestFailed && productsError?.message) || (hasPricesRequestFailed && pricesError?.message)}
							</Notice>
						</div>
					)}

					{(status === 'loaded' && ((hasProductsRequestFailed && productsError?.message?.includes('Invalid API Key')) || !canRetrieveProducts)) && (
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<TextControl
								label={__('Stripe API Key', 'otter-blocks')}
								type="text"
								placeholder={__('Type here the Stripe API Key', 'otter-blocks')}
								value={apiKey}
								className="components-placeholder__input"
								onChange={setAPIKey}
								autoComplete='off'
							/>

							<div>
								<Button
									isPrimary
									type="submit"
									onClick={() => {
										window.oTrk?.add({ feature: 'stripe', featureComponent: 'api-key' });
										saveApiKey();
									}}
								>
									{__('Save', 'otter-blocks')}
								</Button>
							</div>

							<br />

							<ExternalLink href={window.themeisleGutenberg.optionsPath}>{__('You can also set it from Dashboard', 'otter-blocks')}</ExternalLink>
						</div>
					)}

					{status === 'error' && (
						<Fragment>
							{__('An error occurred during API Key checking.', 'otter-blocks')}
						</Fragment>
					)}

					{(status === 'loaded' && !hasProductsRequestFailed && canRetrieveProducts) && (
						<Fragment>
							{!isLoadingProducts && (
								<SelectControl
									label={__('Select a product to display.', 'otter-blocks')}
									value={attributes.product}
									options={[
										{
											label: __('Select a product', 'otter-blocks'),
											value: 'none'
										},
										...productsList
									]}
									onChange={(product: string) => {
										window.oTrk?.add({ feature: 'stripe-checkout', featureComponent: 'product-changed' });
										setAttributes({ product: product !== 'none' ? product : undefined });
									}}
								/>
							)}

							{(!isLoadingPrices && attributes.product) && (
								<SelectControl
									label={__('Select the price you want to display.', 'otter-blocks')}
									value={attributes.price}
									options={[
										{
											label: __('Select a price', 'otter-blocks'),
											value: 'none'
										},
										...pricesList
									]}
									onChange={(price: string) => {
										window.oTrk?.add({ feature: 'stripe-checkout', featureComponent: 'price-changed' });
										setAttributes({ price: price !== 'none' ? price : undefined });
									}}
								/>
							)}

							{(isLoadingProducts || isLoadingPrices) && <Placeholder><Spinner /></Placeholder>}
						</Fragment>
					)}
				</Placeholder>
			</div>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={attributes}
				setAttributes={setAttributes}
				view={view}
				setView={setView}
				isLoadingProducts={isLoadingProducts}
				productsList={productsList}
				isLoadingPrices={isLoadingPrices}
				pricesList={pricesList}
				apiKey={apiKey}
				setAPIKey={setAPIKey}
				saveApiKey={saveApiKey}
				status={status}
			/>

			<div {...blockProps}>
				{view === 'default' && (
					<Fragment>
						<div className="o-stripe-checkout">
							{meta?.image && (
								<img src={meta.image} alt={meta?.description} />
							)}

							<div className="o-stripe-checkout-description">
								<h3>{meta?.name}</h3>
								<h5>{meta?.price}</h5>
							</div>
						</div>

						<a>{__('Checkout', 'otter-blocks')}</a>
					</Fragment>
				)}

				{view === 'success' && (attributes.successMessage || __('Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-blocks'))}
				{view === 'cancel' && (attributes.cancelMessage || __('Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-blocks'))}
			</div>
		</Fragment>
	);
};

export default memo(Edit);
