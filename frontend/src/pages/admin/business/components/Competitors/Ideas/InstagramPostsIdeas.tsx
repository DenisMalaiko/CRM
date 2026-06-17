import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function InstagramPostsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.InstagramPost} title="Instagram Posts Ideas" />;
}

export default InstagramPostsIdeas;
