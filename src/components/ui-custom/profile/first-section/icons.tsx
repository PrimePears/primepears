import Image from "next/image";

export const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <Image src="/social-media/x.svg" alt="x" width={size} height={size} />
);

export const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <Image src="/social-media/facebook.svg" alt="x" width={size} height={size} />
);
export const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <Image src="/social-media/instagram.svg" alt="x" width={size} height={size} />
);
export const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <Image src="/social-media/youtube.svg" alt="x" width={size} height={size} />
);
