import { MediaType } from './MediaType';

describe('MediaType enum', () => {
  it('has an Image value equal to "Image"', () => {
    expect(MediaType.Image).toBe('Image');
  });

  it('has a Video value equal to "Video"', () => {
    expect(MediaType.Video).toBe('Video');
  });

  it('contains exactly two members', () => {
    const values = Object.values(MediaType);
    expect(values).toHaveLength(2);
  });

  it('Photo and Video are distinct values', () => {
    expect(MediaType.Image).not.toBe(MediaType.Video);
  });
});
