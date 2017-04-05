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

if ( ! defined('ABSPATH') || ! \is_admin() ) {
    return;
}

const DELETE_POSTS_VERSION = '1.0.0';
const POST_DOES_NOT_EXIST = 'does not exist';
const NOT_ALLOWED_TO_DELETE = 'not allowed';
const POST_DELETED = 'deleted';
const POST_NOT_DELETED = 'not deleted';
const DELETE_POST_NONCE_ACTION = 'delete-posts-by-url';

function adminStyles()
{
    \wp_enqueue_style('delete-posts', plugins_url('/dist/main.css', __FILE__ ), [], DELETE_POSTS_VERSION);
}

function adminScripts()
{
    \wp_register_script('delete-posts', plugins_url('/dist/main.js', __FILE__ ), [], DELETE_POSTS_VERSION, true);

    \wp_localize_script('delete-posts', 'deletePosts', [
        'nonce' => \wp_create_nonce( DELETE_POST_NONCE_ACTION ),
        'status' => [
            'POST_DOES_NOT_EXIST' => POST_DOES_NOT_EXIST,
            'NOT_ALLOWED_TO_DELETE' => NOT_ALLOWED_TO_DELETE,
            'POST_DELETED' => POST_DELETED,
            'POST_NOT_DELETED' => POST_NOT_DELETED,
        ],
    ]);

    \wp_enqueue_script('delete-posts');
}

function setLock()
{
    \set_transient( 'delete-posts-running', 1, 3600 );
}

function deleteLock()
{
    \delete_transient( 'delete-posts-running' );
}

function lockExists()
{
    return \get_transient( 'delete-posts-running' ) !== false;
}

function adminMenu()
{
    $hook = \add_management_page(
        'Delete Posts',
        'Delete Posts',
        'delete_posts',
        'delete-posts',
        __NAMESPACE__ . '\deletePostsPage'
    );

    if ( $hook !== false ) {
        \add_action('admin_print_styles-' . $hook, __NAMESPACE__ . '\adminStyles');
        \add_action('admin_print_scripts-' . $hook, __NAMESPACE__ . '\adminScripts');
    }
}

function ajaxDeletePostByURL()
{
    if ( ! \check_ajax_referer( DELETE_POST_NONCE_ACTION, 'nonce', false ) ) {

        \wp_send_json_error( [ 'message' => 'nonce is invalid' ], 403 );

    } elseif ( \current_user_can('delete_posts') && isset( $_POST['urls'] ) && is_array( $_POST['urls'] ) ) {

        $urls = array_fill_keys( $_POST['urls'], false );
        $forceDelete = isset( $_POST['forceDelete'] ) ? $_POST['forceDelete'] === 'true' : false;

        foreach( $urls as $url => &$deleted ) {
            $deleted = deletePostByURL( $url, $forceDelete );
        }

        \wp_send_json_success( $urls );

    } else {

        \wp_send_json_error( [ 'message' => 'you cannot delete posts' ], 401 );

    }

    die();
}

function deletePostByURL( $url, $forceDelete = false )
{
    $post_id = \url_to_postid( $url );

    if ( ! $post_id ) {
        return POST_DOES_NOT_EXIST;
    }

    if ( \current_user_can( 'delete_posts', $post_id ) ) {
        return \wp_delete_post( $post_id, $forceDelete ) !== false ? POST_DELETED : POST_NOT_DELETED;
    }

    return NOT_ALLOWED_TO_DELETE;
}

function deletePostsPage()
{
    include __DIR__ . '/delete-posts-page.php';
}

\add_action( 'wp_ajax_delete_post_by_url', __NAMESPACE__ . '\ajaxDeletePostByURL' );

\add_action( 'admin_menu', __NAMESPACE__ . '\adminMenu' );
