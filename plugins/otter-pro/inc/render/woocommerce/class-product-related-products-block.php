<?php
/**
 * Product_Related_Products_Block
 *
 * @package ThemeIsle\Otter_Pro\Render
 */

namespace ThemeIsle\Otter_Pro\Render;

/**
 * Class Product_Related_Products_Block
 */
class Product_Related_Products_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		if ( ! class_exists( 'WooCommerce' ) || is_admin() ) {
			return;
		}

		ob_start();

		global $product;

		if ( ! $product ) {
			return;
		};
		woocommerce_output_related_products();
		$output = ob_get_clean();
		return $output;
	}
}
