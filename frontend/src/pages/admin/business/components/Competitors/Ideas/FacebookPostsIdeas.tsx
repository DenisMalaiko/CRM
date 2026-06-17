import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function FacebookPostsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.FacebookPost} title="Facebook Posts Ideas" />;
}

export default FacebookPostsIdeas;
