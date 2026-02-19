/*
  # Create increment_blog_views RPC Function

  1. New Functions
    - `increment_blog_views(post_id uuid)`: Safely increments the view_count of a blog post
    - Uses security definer to allow anonymous increments without direct table write access
    - Returns the new view count value

  2. Notes
    - This function is called from the frontend when a user views a blog post
    - The view_count column was added in the previous migration
    - No authentication required - any visitor can increment the count
*/

CREATE OR REPLACE FUNCTION increment_blog_views(post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id AND is_published = true
  RETURNING view_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION increment_blog_views(uuid) TO anon, authenticated;
