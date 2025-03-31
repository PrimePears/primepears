import Image from "next/image";

export const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <Image
    src="/icons/x.svg" // Update this path to match your icon's location
    alt="x"
    width={size}
    height={size}
  />
);

export const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <Image
    src="/icons/facebook.svg" // Update this path to match your icon's location
    alt="x"
    width={size}
    height={size}
  />
);
export const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <Image
    src="/icons/instagram.svg" // Update this path to match your icon's location
    alt="x"
    width={size}
    height={size}
  />
);
export const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <Image
    src="/icons/youtube.svg" // Update this path to match your icon's location
    alt="x"
    width={size}
    height={size}
  />
);
