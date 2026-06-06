import { useEffect } from "react";
import SeoArticleRenderer from "@/components/seo/SeoArticleRenderer";
import type { SeoArticleData } from "@/data/seo/types";

interface Props {
  data: SeoArticleData;
}

export default function SeoArticlePage({ data }: Props) {
  useEffect(() => {
    document.title = data.title;
  }, [data.title]);

  const breadcrumbItems = [
    { name: "NobilForm", url: "/" },
    { name: data.h1, url: `/${data.slug}` },
  ];

  return <SeoArticleRenderer data={data} breadcrumbItems={breadcrumbItems} />;
}
