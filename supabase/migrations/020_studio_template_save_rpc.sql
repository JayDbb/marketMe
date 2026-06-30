-- Studio template save/update via SECURITY DEFINER (fixes RLS insert failures).

-- Uses auth.uid() inside Postgres so user_id always matches the session.

-- Cast user_id::uuid — column may be text in live DB (matches 012 / business_profiles).



DROP POLICY IF EXISTS "Users can view their own templates" ON public.studio_templates;

CREATE POLICY "Users can view their own templates"

  ON public.studio_templates FOR SELECT

  USING (user_id::uuid = auth.uid());



DROP POLICY IF EXISTS "Users can insert their own templates" ON public.studio_templates;

CREATE POLICY "Users can insert their own templates"

  ON public.studio_templates FOR INSERT

  WITH CHECK (user_id::uuid = auth.uid());



DROP POLICY IF EXISTS "Users can update their own templates" ON public.studio_templates;

CREATE POLICY "Users can update their own templates"

  ON public.studio_templates FOR UPDATE

  USING (user_id::uuid = auth.uid())

  WITH CHECK (user_id::uuid = auth.uid());



DROP POLICY IF EXISTS "Users can delete their own templates" ON public.studio_templates;

CREATE POLICY "Users can delete their own templates"

  ON public.studio_templates FOR DELETE

  USING (user_id::uuid = auth.uid());



CREATE OR REPLACE FUNCTION public.insert_studio_template(

  p_name text,

  p_file_path text,

  p_file_url text,

  p_source text DEFAULT 'upload',

  p_category text DEFAULT NULL,

  p_template_type text DEFAULT 'image',

  p_canvas_data jsonb DEFAULT NULL,

  p_pexels_id text DEFAULT NULL,

  p_unsplash_id text DEFAULT NULL,

  p_author_name text DEFAULT NULL,

  p_author_url text DEFAULT NULL

)

RETURNS public.studio_templates

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = public

AS $$

DECLARE

  uid uuid := auth.uid();

  row public.studio_templates;

BEGIN

  IF uid IS NULL THEN

    RAISE EXCEPTION 'Not authenticated';

  END IF;



  INSERT INTO public.studio_templates (

    user_id,

    name,

    category,

    file_path,

    file_url,

    source,

    template_type,

    canvas_data,

    pexels_id,

    unsplash_id,

    author_name,

    author_url

  )

  VALUES (

    uid::text,

    p_name,

    p_category,

    p_file_path,

    p_file_url,

    p_source,

    p_template_type,

    p_canvas_data,

    p_pexels_id,

    p_unsplash_id,

    p_author_name,

    p_author_url

  )

  RETURNING * INTO row;



  RETURN row;

END;

$$;



CREATE OR REPLACE FUNCTION public.update_studio_canvas_template(

  p_id uuid,

  p_name text DEFAULT NULL,

  p_category text DEFAULT NULL,

  p_file_url text DEFAULT NULL,

  p_canvas_data jsonb DEFAULT NULL

)

RETURNS public.studio_templates

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = public

AS $$

DECLARE

  uid uuid := auth.uid();

  row public.studio_templates;

BEGIN

  IF uid IS NULL THEN

    RAISE EXCEPTION 'Not authenticated';

  END IF;



  UPDATE public.studio_templates

  SET

    name = COALESCE(p_name, name),

    category = COALESCE(p_category, category),

    file_url = COALESCE(p_file_url, file_url),

    canvas_data = COALESCE(p_canvas_data, canvas_data),

    template_type = 'canvas'

  WHERE id = p_id

    AND user_id::uuid = uid

  RETURNING * INTO row;



  IF row.id IS NULL THEN

    RAISE EXCEPTION 'Template not found or access denied';

  END IF;



  RETURN row;

END;

$$;



REVOKE ALL ON FUNCTION public.insert_studio_template(

  text, text, text, text, text, text, jsonb, text, text, text, text

) FROM PUBLIC;



GRANT EXECUTE ON FUNCTION public.insert_studio_template(

  text, text, text, text, text, text, jsonb, text, text, text, text

) TO authenticated;



REVOKE ALL ON FUNCTION public.update_studio_canvas_template(

  uuid, text, text, text, jsonb

) FROM PUBLIC;



GRANT EXECUTE ON FUNCTION public.update_studio_canvas_template(

  uuid, text, text, text, jsonb

) TO authenticated;

