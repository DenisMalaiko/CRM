import reducer, { setPhotosAi } from "./photoAiSlice";
import { TAiPhoto } from "../../../models/AiPhoto";

const mockPhotos: TAiPhoto[] = [
  {
    id: "photo-1",
    businessId: "biz-1",
    url: "https://example.com/photo1.jpg",
    prompt: "a sunset over the ocean",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "photo-2",
    businessId: "biz-1",
    url: "https://example.com/photo2.jpg",
    prompt: "a mountain landscape",
    createdAt: new Date("2024-01-16"),
  },
];

describe("photoAiSlice", () => {
  describe("initial state", () => {
    test("has photosAi as null", () => {
      const state = reducer(undefined, { type: "@@INIT" });
      expect(state.photosAi).toBeNull();
    });
  });

  describe("setPhotosAi", () => {
    test("updates photosAi with provided array", () => {
      const state = reducer(undefined, setPhotosAi(mockPhotos));
      expect(state.photosAi).toEqual(mockPhotos);
    });

    test("replaces existing photosAi with new array", () => {
      const initial = reducer(undefined, setPhotosAi(mockPhotos));
      const updated: TAiPhoto[] = [
        {
          id: "photo-3",
          businessId: "biz-1",
          url: "https://example.com/photo3.jpg",
          prompt: "a city skyline",
          createdAt: new Date("2024-01-17"),
        },
      ];
      const state = reducer(initial, setPhotosAi(updated));
      expect(state.photosAi).toEqual(updated);
      expect(state.photosAi).toHaveLength(1);
    });

    test("updates photosAi with empty array", () => {
      const initial = reducer(undefined, setPhotosAi(mockPhotos));
      const state = reducer(initial, setPhotosAi([]));
      expect(state.photosAi).toEqual([]);
    });
  });
});
