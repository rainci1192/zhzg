Extract into E:\zgweb, then run:
cd E:\zgweb
git apply --check .\article-detail-date-views.patch
git apply .\article-detail-date-views.patch
Restart Strapi, then restart frontend. Existing article counts start at zero.
