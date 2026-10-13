"use client";

import { resolveBundledImage } from "@/lib/bundled-images";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isLegacyUploadUrl } from "@/lib/upload-rules";

export const PLACEHOLDER = "/images/placeholder.svg";

function initialSrc(src: ImageProps["src"]) {
  if (typeof src !== "string") return src;
  // Empty values and legacy disk paths (which no longer exist on serverless hosts) use the placeholder.
  if (!src.trim() || isLegacyUploadUrl(src)) return PLACEHOLDER;
  return resolveBundledImage(src);
}

/**
 * next/image with a reliable fallback. Switches to the placeholder once on load error;
 * the placeholder itself never retries, which prevents fallback loops.
 */
export default function SafeImage({ src, alt, ...rest }: ImageProps) {
  const start = initialSrc(src);
  const [failedFor, setFailedFor] = useState<ImageProps["src"] | null>(null);
  const current = failedFor === start ? PLACEHOLDER : start;
  const isPlaceholder = current === PLACEHOLDER;

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      unoptimized={isPlaceholder || rest.unoptimized}
      onError={(e) => {
        if (!isPlaceholder) setFailedFor(start);
        rest.onError?.(e);
      }}
    />
  );
}
