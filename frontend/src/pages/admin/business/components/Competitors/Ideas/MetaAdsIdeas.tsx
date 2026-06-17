import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function MetaAdsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.FacebookAd} title="Meta Ads Ideas" />;
}

export default MetaAdsIdeas;
