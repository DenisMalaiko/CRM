import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostOverlay } from './PostOverlay';

describe('PostOverlay', () => {
  it('renders an iframe element', () => {
    render(<PostOverlay overlayHtml="<div>overlay</div>" />);

    expect(screen.getByTitle('Post overlay').tagName.toLowerCase()).toBe('iframe');
  });

  it('sets the sandbox attribute to an empty string', () => {
    render(<PostOverlay overlayHtml="<div>overlay</div>" />);

    expect(screen.getByTitle('Post overlay')).toHaveAttribute('sandbox', '');
  });

  it('sets srcDoc containing the provided overlayHtml', () => {
    const overlayHtml = '<p class="label">Hello</p>';

    render(<PostOverlay overlayHtml={overlayHtml} />);

    const iframe = screen.getByTitle('Post overlay');
    expect(iframe.getAttribute('srcdoc')).toContain(overlayHtml);
  });

  it('wraps the overlayHtml in a full HTML document in srcDoc', () => {
    render(<PostOverlay overlayHtml="<span>test</span>" />);

    const srcdoc = screen.getByTitle('Post overlay').getAttribute('srcdoc') ?? '';
    expect(srcdoc).toContain('<!DOCTYPE html>');
    expect(srcdoc).toContain('<body>');
    expect(srcdoc).toContain('<span>test</span>');
  });

  it('applies pointer-events-none class to the iframe', () => {
    render(<PostOverlay overlayHtml="<div />" />);

    expect(screen.getByTitle('Post overlay')).toHaveClass('pointer-events-none');
  });

  it('renders with title "Post overlay"', () => {
    render(<PostOverlay overlayHtml="<div />" />);

    expect(screen.getByTitle('Post overlay')).toBeInTheDocument();
  });
});
