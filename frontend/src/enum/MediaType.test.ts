import { MediaType } from './MediaType';

describe('MediaType enum', () => {
  it('has a Photo value equal to "Photo"', () => {
    expect(MediaType.Image).toBe('Photo');
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
