import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function InstagramReelsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.InstagramReel} title="Instagram Reels Ideas" />;
}

export default InstagramReelsIdeas;
