export interface TagConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const TAG_MAP: Record<string, TagConfig> = {
  신청곡: {
    label: "신청곡",
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-300",
  },
};

export const TAG_OPTIONS = Object.keys(TAG_MAP);

export function getTagStyle(tag: string): TagConfig {
  return (
    TAG_MAP[tag] ?? {
      label: tag,
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
    }
  );
}
