import Image from 'next/image';

interface Props {
  /** Use 'sm' for admin header (slightly tighter) */
  size?: 'default' | 'sm';
}

const BN_LOGO = '/bjarne-nielsen-logo.png';
const ZEEKR_LOGO = '/zeekr-logo.jpg';

export default function HeaderLogos({ size = 'default' }: Props) {
  const bnH = size === 'sm' ? 28 : 32;
  const zeekrH = size === 'sm' ? 22 : 26;

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <Image
        src={BN_LOGO}
        alt="Bjarne Nielsen"
        width={180}
        height={bnH}
        priority
        className="object-contain w-auto"
        style={{ height: bnH }}
      />
      <div className="h-6 w-px bg-neutral-200 shrink-0" />
      <Image
        src={ZEEKR_LOGO}
        alt="Zeekr"
        width={90}
        height={zeekrH}
        priority
        className="object-contain w-auto"
        style={{ height: zeekrH }}
      />
    </div>
  );
}
