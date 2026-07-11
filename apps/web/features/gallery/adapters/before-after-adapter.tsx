"use client";
/**
 * BeforeAfterAdapter — vendor abstraction layer for before/after image comparison.
 *
 * Gallery components use this adapter exclusively.
 * The underlying library (react-compare-slider) is an implementation detail
 * hidden behind this interface. Swapping vendors requires changing only this file.
 *
 * Replacement guide:
 *   1. Install new library
 *   2. Update imports below
 *   3. Map BeforeAfterAdapterProps to new library's props
 *   4. All gallery components continue to work unchanged
 *
 * Current vendor: react-compare-slider ^3.x
 * Vendor import confined to THIS FILE ONLY.
 */
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

export interface BeforeAfterAdapterProps {
  beforeSrc:    string;
  afterSrc:     string;
  beforeAlt?:   string;
  afterAlt?:    string;
  className?:   string;
}

export function BeforeAfterAdapter({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt  = "After",
  className,
}: BeforeAfterAdapterProps) {
  return (
    <ReactCompareSlider
      className={className}
      itemOne={<ReactCompareSliderImage src={beforeSrc} alt={beforeAlt} />}
      itemTwo={<ReactCompareSliderImage src={afterSrc}  alt={afterAlt}  />}
    />
  );
}
