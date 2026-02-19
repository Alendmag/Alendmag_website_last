/*
  # Seed Blog Posts
  Adds initial blog posts in Arabic and English for the company blog section.
*/

INSERT INTO blog_posts (title_ar, title_en, slug, excerpt_ar, excerpt_en, content_ar, content_en, image_url, category, tags, is_published, published_at)
VALUES
(
  'مستقبل الذكاء الاصطناعي في الأعمال',
  'The Future of AI in Business',
  'future-of-ai-in-business',
  'كيف يمكن للشركات الاستفادة من تقنيات الذكاء الاصطناعي لتحسين الأداء وزيادة الكفاءة التشغيلية',
  'How businesses can leverage AI technologies to improve performance and increase operational efficiency',
  'يشهد العالم ثورة حقيقية في مجال الذكاء الاصطناعي، حيث أصبحت هذه التقنية جزءاً لا يتجزأ من عمليات الشركات الحديثة. من أتمتة العمليات الروتينية إلى تحليل البيانات الضخمة واتخاذ القرارات الذكية، يفتح الذكاء الاصطناعي آفاقاً جديدة للنمو والابتكار في كل قطاع.',
  'The world is witnessing a real revolution in artificial intelligence, where this technology has become an integral part of modern company operations. From automating routine processes to analyzing big data and making intelligent decisions, AI opens new horizons for growth and innovation in every sector.',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
  'technology',
  ARRAY['AI', 'Technology', 'Business'],
  true,
  now() - interval '5 days'
),
(
  'أهمية الأمن السيبراني لشركتك',
  'Why Cybersecurity Matters for Your Business',
  'cybersecurity-importance',
  'دليل شامل لحماية بيانات شركتك من التهديدات الإلكترونية المتزايدة',
  'A comprehensive guide to protecting your company data from increasing cyber threats',
  'في عالم متصل رقمياً، أصبح الأمن السيبراني ضرورة حتمية وليس مجرد خيار. تتعرض الشركات يومياً لآلاف محاولات الاختراق، ويمكن أن يكلف اختراق واحد الشركة ملايين الدولارات في الخسائر. يتناول هذا المقال أبرز التهديدات وكيفية التصدي لها.',
  'In a digitally connected world, cybersecurity has become an imperative necessity and not just an option. Companies face thousands of hacking attempts daily, and a single breach can cost the company millions of dollars in losses. This article covers the most prominent threats and how to counter them.',
  'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
  'security',
  ARRAY['Security', 'Cybersecurity', 'Protection'],
  true,
  now() - interval '10 days'
),
(
  'أنظمة ERP: دليل المبتدئين الشامل',
  'ERP Systems: The Complete Beginner''s Guide',
  'erp-systems-beginners-guide',
  'ما هو نظام ERP ولماذا تحتاجه شركتك؟ دليل شامل للمبتدئين',
  'What is an ERP system and why does your company need it? A comprehensive guide for beginners',
  'نظام تخطيط موارد المؤسسات (ERP) هو برنامج متكامل يدمج جميع أقسام الشركة في منصة واحدة. يربط المحاسبة بالمخزون بالموارد البشرية بالمبيعات، مما يوفر رؤية شاملة لأعمال الشركة ويحسن الكفاءة التشغيلية بشكل كبير.',
  'An Enterprise Resource Planning (ERP) system is an integrated software that unifies all company departments on a single platform. It connects accounting with inventory with human resources with sales, providing a comprehensive view of company operations and significantly improving operational efficiency.',
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
  'software',
  ARRAY['ERP', 'Business Software', 'Management'],
  true,
  now() - interval '15 days'
)
ON CONFLICT (slug) DO NOTHING;
