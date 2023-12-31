
<!-- ======[ WP functions.php - Setup User ID in the Browser Cookie ]======
public\wp-content\themes\storefront\functions.php -->

function set_userid_cookie($username, $user) {
	$userid_cookie_name = 'userId';
	$user_id = $user -> ID;

	if (!isset($_COOKIE[$userid_cookie_name])) {
		setcookie($userid_cookie_name, $user_id, time() + 3600, COOKIEPATH, COOKIE_DOMAIN);
	}
}

add_action('wp_login', 'set_userid_cookie', 10, 2);

function remove_userid_cookie() {
	$userid_cookie_name = 'userId';
	if (isset($_COOKIE[$userid_cookie_name])) {
		unset($_COOKIE[$userid_cookie_name]);
		setcookie($userid_cookie_name, "", time() - 3600);
	}
}

add_action('wp_logout', 'remove_userid_cookie');







<!-- ======[ WP cart.php - Set attributes for Data Collection & create Global JS Variables ]======
public\wp-content\plugins\woocommerce\templates\cart\cart.php -->


		<tbody>
			<?php do_action( 'woocommerce_before_cart_contents' ); ?>

			<script>
				var variations = new Map();
			</script>

			<?php
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				$_product   = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
				$product_id = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );

				if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters( 'woocommerce_cart_item_visible', true, $cart_item, $cart_item_key ) ) {
					$product_permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
					?>
					<script>
						var variationId = "<?php echo $cart_item['variation_id'];?>";
						var productId = "<?php echo $cart_item['product_id'];?>";
						variations.set(productId, variationId);
					</script>
					<tr class="woocommerce-cart-form__cart-item <?php echo esc_attr( apply_filters( 'woocommerce_cart_item_class', 'cart_item', $cart_item, $cart_item_key ) ); ?>"
						product-id = "<?php echo $cart_item['product_id'];?>" variation = "<?php echo $cart_item['variation_id'];?>">

						<td class="product-remove">
							<?php
								echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									'woocommerce_cart_item_remove_link',
									sprintf(
										'<a href="%s" class="remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">&times;</a>',
										esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
										esc_html__( 'Remove this item', 'woocommerce' ),
										esc_attr( $product_id ),
										esc_attr( $_product->get_sku() )
									),
									$cart_item_key
								);
							?>
						</td>

						<td class="product-thumbnail">
						<?php
						$thumbnail = apply_filters( 'woocommerce_cart_item_thumbnail', $_product->get_image(), $cart_item, $cart_item_key );

						if ( ! $product_permalink ) {
							echo $thumbnail; // PHPCS: XSS ok.
						} else {
							printf( '<a href="%s">%s</a>', esc_url( $product_permalink ), $thumbnail ); // PHPCS: XSS ok.
						}
						?>
						</td>

						<td class="product-name" data-title="<?php esc_attr_e( 'Product', 'woocommerce' ); ?>">
						<?php
						if ( ! $product_permalink ) {
							echo wp_kses_post( apply_filters( 'woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key ) . '&nbsp;' );
						} else {
							echo wp_kses_post( apply_filters( 'woocommerce_cart_item_name', sprintf( '<a href="%s">%s</a>', esc_url( $product_permalink ), $_product->get_name() ), $cart_item, $cart_item_key ) );
						}

						do_action( 'woocommerce_after_cart_item_name', $cart_item, $cart_item_key );

						// Meta data.
						echo wc_get_formatted_cart_item_data( $cart_item ); // PHPCS: XSS ok.

						// Backorder notification.
						if ( $_product->backorders_require_notification() && $_product->is_on_backorder( $cart_item['quantity'] ) ) {
							echo wp_kses_post( apply_filters( 'woocommerce_cart_item_backorder_notification', '<p class="backorder_notification">' . esc_html__( 'Available on backorder', 'woocommerce' ) . '</p>', $product_id ) );
						}
						?>
						</td>

						<td class="product-price" data-title="<?php esc_attr_e( 'Price', 'woocommerce' ); ?>">
							<?php
								echo apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $_product ), $cart_item, $cart_item_key ); // PHPCS: XSS ok.
							?>
						</td>

						<td class="product-quantity" data-title="<?php esc_attr_e( 'Quantity', 'woocommerce' ); ?>">
						<?php
						if ( $_product->is_sold_individually() ) {
							$product_quantity = sprintf( '1 <input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key );
						} else {
							$product_quantity = woocommerce_quantity_input(
								array(
									'input_name'   => "cart[{$cart_item_key}][qty]",
									'input_value'  => $cart_item['quantity'],
									'max_value'    => $_product->get_max_purchase_quantity(),
									'min_value'    => '0',
									'product_name' => $_product->get_name(),
								),
								$_product,
								false
							);
						}

						echo apply_filters( 'woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item ); // PHPCS: XSS ok.
						?>
						</td>

						<td class="product-subtotal" data-title="<?php esc_attr_e( 'Subtotal', 'woocommerce' ); ?>">
							<?php
								echo apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key ); // PHPCS: XSS ok.
							?>
						</td>
					</tr>
					<?php
				}
			}
			?>

			<?php do_action( 'woocommerce_cart_contents' ); ?>

			<tr>
				<td colspan="6" class="actions">

					<?php if ( wc_coupons_enabled() ) { ?>
						<div class="coupon">
							<label for="coupon_code"><?php esc_html_e( 'Coupon:', 'woocommerce' ); ?></label> <input type="text" name="coupon_code" class="input-text" id="coupon_code" value="" placeholder="<?php esc_attr_e( 'Coupon code', 'woocommerce' ); ?>" /> <button type="submit" class="button" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?>"><?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?></button>
							<?php do_action( 'woocommerce_cart_coupon' ); ?>
						</div>
					<?php } ?>

					<button type="submit" class="button" name="update_cart" value="<?php esc_attr_e( 'Update cart', 'woocommerce' ); ?>"><?php esc_html_e( 'Update cart', 'woocommerce' ); ?></button>

					<?php do_action( 'woocommerce_cart_actions' ); ?>

					<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
				</td>
			</tr>

			<?php do_action( 'woocommerce_after_cart_contents' ); ?>
		</tbody>






<!-- ======[ WP wc-template-functions.php - Data Collection modify wc template functions (get id) ]======
public\wp-content\plugins\woocommerce\includes\wc-template-functions.php -->


if ( ! function_exists( 'woocommerce_template_loop_product_link_open' ) ) {
	/**
	 * Insert the opening anchor tag for products in the loop.
	 */
	function woocommerce_template_loop_product_link_open() {
		global $product;
		$pId = $product -> get_id();

		$link = apply_filters( 'woocommerce_loop_product_link', get_the_permalink(), $product );

		echo '<a href="' . esc_url( $link ) . '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link ga-wc-product" product-id="'.$pId.'">';
	}
}




<!-- ======[ WP AbstractProductGrid.php - Data Collection modify Abstract Product Grid (get id) ]======
public\wp-content\plugins\woocommerce\packages\woocommerce-blocks\src\BlockTypes\AbstractProductGrid.php -->


		/**
		 * Filters the HTML for products in the grid.
		 *
		 * @param string $html Product grid item HTML.
		 * @param array $data Product data passed to the template.
		 * @param \WC_Product $product Product object.
		 * @return string Updated product grid item HTML.
		 */
		$pId = $product -> get_id();
		return apply_filters(
			'woocommerce_blocks_product_grid_item_html',
			"<li class=\"wc-block-grid__product\">
				<a href=\"{$data->permalink}\" class=\"wc-block-grid__product-link ga-wc-product\" product-id=\"{$pId}\">
					{$data->image}
					{$data->title}
				</a>
				{$data->badge}
				{$data->price}
				{$data->rating}
				{$data->button}
			</li>",
			$data,
			$product
		);







<!-- ======[ WP variation-add-to-cart-button.php - Data Collection add variation into attribute ]======
public\wp-content\plugins\woocommerce\templates\single-product\add-to-cart\variation-add-to-cart-button.php -->


<div class="woocommerce-variation-add-to-cart variations_button">
	<?php do_action( 'woocommerce_before_add_to_cart_button' ); ?>

	<?php
	do_action( 'woocommerce_before_add_to_cart_quantity' );

	woocommerce_quantity_input(
		array(
			'min_value'   => apply_filters( 'woocommerce_quantity_input_min', $product->get_min_purchase_quantity(), $product ),
			'max_value'   => apply_filters( 'woocommerce_quantity_input_max', $product->get_max_purchase_quantity(), $product ),
			'input_value' => isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
		)
	);

	do_action( 'woocommerce_after_add_to_cart_quantity' );
	?>

	<button type="submit" class="single_add_to_cart_button button alt" value="<?php echo absint( $product->get_id() ); ?>" ><?php echo esc_html( $product->single_add_to_cart_text() ); ?></button>

	<?php do_action( 'woocommerce_after_add_to_cart_button' ); ?>

	<input type="hidden" name="add-to-cart" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="product_id" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="variation_id" class="variation_id" value="0" />
</div>








<!-- ======[ WP wc-formatting-functions.php - Data Collection add variation price into attribute ]======
public\wp-content\plugins\woocommerce\includes\wc-formatting-functions.php -->


	/**
	 * Filter formatted price.
	 *
	 * @param float        $formatted_price    Formatted price.
	 * @param float        $price              Unformatted price.
	 * @param int          $decimals           Number of decimals.
	 * @param string       $decimal_separator  Decimal separator.
	 * @param string       $thousand_separator Thousand separator.
	 * @param float|string $original_price     Original price as float, or empty string. Since 5.0.0.
	 */
	$price = apply_filters( 'formatted_woocommerce_price', number_format( $price, $args['decimals'], $args['decimal_separator'], $args['thousand_separator'] ), $price, $args['decimals'], $args['decimal_separator'], $args['thousand_separator'], $original_price );

	if ( apply_filters( 'woocommerce_price_trim_zeros', false ) && $args['decimals'] > 0 ) {
		$price = wc_trim_zeros( $price );
	}

	$formatted_price = ( $negative ? '-' : '' ) . sprintf( $args['price_format'], '<span class="woocommerce-Price-currencySymbol">' . get_woocommerce_currency_symbol( $args['currency'] ) . '</span>', $price );
	$return          = '<span class="woocommerce-Price-amount amount" data-price="'.$price.'"><bdi>' . $formatted_price . '</bdi></span>';

	if ( $args['ex_tax_label'] && wc_tax_enabled() ) {
		$return .= ' <small class="woocommerce-Price-taxLabel tax_label">' . WC()->countries->ex_tax_or_vat() . '</small>';
	}





 


<!-- ======[ WP review-order.php - Add attributes in review order items : product-id, parent-id, price, quantity ]======
public\wp-content\plugins\woocommerce\templates\checkout\review-order.php -->


			if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters( 'woocommerce_checkout_cart_item_visible', true, $cart_item, $cart_item_key ) ) {
				?>
				<tr class="<?php echo esc_attr( apply_filters( 'woocommerce_cart_item_class', 'cart_item', $cart_item, $cart_item_key ) ); ?>">
					<td class="product-name ga-wc-product namme" data-product-id="<?php echo $_product->get_id();?>" data-parent-id="<?php echo $_product->get_parent_id();?>" data-price="<?php echo $_product->get_price();?> data-quantity= <?php echo $cart_item['quantity'] ?>">
						<?php echo wp_kses_post( apply_filters( 'woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key ) ) . '&nbsp;'; ?>
						<?php echo apply_filters( 'woocommerce_checkout_cart_item_quantity', ' <strong class="product-quantity">' . sprintf( '&times;&nbsp;%s', $cart_item['quantity'] ) . '</strong>', $cart_item, $cart_item_key ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</td>
					<td class="product-total">
						<?php echo apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</td>
				</tr>
				<?php
			}









// ======[ WP cart.php - Add id, quantity, variation_id, price attributes into remove item button ]======
// public\wp-content\plugins\woocommerce\templates\cart\cart.php



						<td class="product-remove">
							<?php
								echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									'woocommerce_cart_item_remove_link',
									sprintf(
										'<a href="%s" class="remove ga-wc-remove" aria-label="%s" data-product_id="%s" data-quantity="%s" data-variation_id="%s" data-price="%s" data-product_sku="%s">&times;</a>',
										esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
										esc_html__( 'Remove this item', 'woocommerce' ),
										esc_attr( $product_id ),
										esc_attr( $cart_item['quantity'] ),
										esc_attr( $_product->get_id() ),
										esc_attr( $_product->get_price() ),
										esc_attr( $_product->get_sku() )
									),
									$cart_item_key
								);
							?>
						</td>







// ======[ WP mini-cart.php - Add id, quantity, variation_id, price attributes into remove item button ]======
// public\wp-content\plugins\woocommerce\templates\cart\mini-cart.php


				<li class="woocommerce-mini-cart-item <?php echo esc_attr( apply_filters( 'woocommerce_mini_cart_item_class', 'mini_cart_item', $cart_item, $cart_item_key ) ); ?>">
					<?php
					echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'woocommerce_cart_item_remove_link',
						sprintf(
							'<a href="%s" class="remove remove_from_cart_button ga-wc-remove" aria-label="%s" data-product_id="%s" data-cart_item_key="%s" data-variation_id="%s" data-quantity="%s" data-price="%s" data-product_sku="%s">&times;</a>',
							esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
							esc_attr__( 'Remove this item', 'woocommerce' ),
							esc_attr( $product_id ),
							esc_attr( $cart_item_key ),
							esc_attr( $_product->get_id() ),
							esc_attr( $cart_item['quantity'] ),
							esc_attr( $_product->get_price() ),
							esc_attr( $_product->get_sku() )
						),
						$cart_item_key
					);
					?>
















// ======[ WP cart.php - Add id, quantity, variation_id, price attributes into quantity input ]======
// public\wp-content\plugins\woocommerce\templates\cart\cart.php

						<td class="product-quantity ga-wc-quantity" data-title="<?php esc_attr_e( 'Quantity', 'woocommerce' ); ?>" data-product_id="<?php echo $product_id; ?>" data-variation_id="<?php echo $_product->get_id(); ?>" data-price="<?php echo $_product->get_price(); ?>"   >
						<?php
						if ( $_product->is_sold_individually() ) {
							$product_quantity = sprintf( '1 <input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key );
						} else {
							$product_quantity = woocommerce_quantity_input(
								array(
									'input_name'   => "cart[{$cart_item_key}][qty]",
									'input_value'  => $cart_item['quantity'],
									'max_value'    => $_product->get_max_purchase_quantity(),
									'min_value'    => '0',
									'product_name' => $_product->get_name(),
								),
								$_product,
								false
							);
						}










// ======[ WP cart.php - Add ga class to update button ]======
// public\wp-content\plugins\woocommerce\templates\cart\cart.php


					<button type="submit" class="button ga-wc-update-cart" name="update_cart" value="<?php esc_attr_e( 'Update cart', 'woocommerce' ); ?>"><?php esc_html_e( 'Update cart', 'woocommerce' ); ?></button>
