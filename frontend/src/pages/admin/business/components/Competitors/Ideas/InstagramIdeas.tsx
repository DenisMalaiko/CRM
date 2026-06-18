import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function InstagramIdeas() {
  return <IdeasTable sourceType={[IdeaSourceType.InstagramPost, IdeaSourceType.InstagramReel]} title="Instagram Ideas" />;
}

export default InstagramIdeas;
