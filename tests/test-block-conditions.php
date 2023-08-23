<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Block_Conditions;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Dynamic Content Test Case.
 */
class TestBlockConditions extends WP_UnitTestCase
{
	/**
	 * The block conditions instance.
	 *
	 * @var Block_Conditions
	 */
	protected $block_conditions;

	/**
	 * The test user ID.
	 *
	 * @var int
	 */
	protected $user_id;

	/**
	 * The test post ID.
	 *
	 * @var int
	 */
	protected $post_id;

	/**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();
		$this->block_conditions = new Block_Conditions();
		$this->user_id          = wp_create_user( 'test_user_deletion', 'userlogin', 'test@userrecover.com' );

		/**
		 * Create a test post.
		 */
		$this->post_id       = $this->factory()->post->create();
		$this->category_slug = 'test-category';
		$this->category_id   = $this->factory()->category->create(
			array(
				'name' => 'Test Category',
				'slug' => $this->category_slug,
			)
		);

		wp_update_post(
			array(
				'ID'            => $this->post_id,
				'post_author'   => $this->user_id,
				'post_type'     => 'post',
				'post_category' => array( $this->category_id ),
			)
		);

		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );
	}

	/**
	 * Test logged-in user when user is logged in.
	 */
	public function test_logged_in_user_on_login() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type' => 'loggedInUser',
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test logged-in user when user is not logged in.
	 */
	public function test_logged_in_user_on_logout() {

		$condition = array(
			'type' => 'loggedInUser',
		);

		wp_set_current_user( 0 );

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test logged-out user when user is logged in.
	 */
	public function test_logged_out_user_on_login() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type' => 'loggedOutUser',
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test logged-out user when user is not logged in.
	 */
	public function test_logged_out_user_on_logout() {

		$condition = array(
			'type' => 'loggedOutUser',
		);

		wp_set_current_user( 0 );

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test user roles when user has the role.
	 */
	public function test_user_roles_has_role() {
		wp_set_current_user( $this->user_id );
		$user = wp_get_current_user();
		$user->set_role( 'administrator' );

		$condition = array(
			'type'  => 'userRoles',
			'roles' => array( 'administrator' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test user roles when user does not have the role.
	 */
	public function test_user_roles_does_not_have_role() {
		wp_set_current_user( $this->user_id );
		$user = wp_get_current_user();
		$user->set_role( 'administrator' );

		$condition = array(
			'type'  => 'userRoles',
			'roles' => array( 'editor' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test the post type condition.
	 */
	public function test_post_type() {

		$condition = array(
			'type'       => 'postType',
			'post_types' => array( 'post' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test the post type condition on invalid post type.
	 */
	public function test_post_type_on_invalid() {

		$condition = array(
			'type'       => 'postType',
			'post_types' => array( 'test' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test the post category condition.
	 */
	public function test_post_category() {

		$condition = array(
			'type'       => 'postCategory',
			'categories' => array( $this->category_slug ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test the post category condition on invalid category.
	 */
	public function test_post_category_on_invalid() {

		$condition = array(
			'type'       => 'postCategory',
			'categories' => array( 'invalid' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	
}
