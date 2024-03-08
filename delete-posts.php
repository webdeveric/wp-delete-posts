<?php
/*
Plugin Name: Delete Posts
Plugin Group: utilities
Description: Delete posts by URL
Version: 1.0.0
Author: Eric King
Author URI: http://webdeveric.com/
*/

namespace webdeveric\DeletePosts;

if (!defined('ABSPATH') || !\is_admin()) {
    return;
}

const DELETE_POSTS_FILE = __FILE__;
const DELETE_POSTS_VERSION = '1.0.0';

include __DIR__ . '/src/functions.php';

\add_action('wp_ajax_delete_post_by_url', __NAMESPACE__ . '\ajaxDeletePostByURL');
\add_action('admin_menu', __NAMESPACE__ . '\adminMenu');
