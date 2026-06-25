import { useEffect } from "react";

import { pageMeta } from "../content/seoContent";
import type { PageMetaKey } from "../content/seoContent";

type PageMetaProps = {
  page: PageMetaKey;
};

export function PageMeta({ page }: PageMetaProps) {
  useEffect(() => {
    const meta = pageMeta[page];
    document.title = meta.title;

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = meta.description;
  }, [page]);

  return null;
}
